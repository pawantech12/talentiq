import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";

import User from "@/app/models/User";
import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";
import { getAuthenticatedUser } from "@/lib/profile-auth";

const DURATION_SECONDS = 5 * 60;
const QUESTION_COUNT = 10;

function jsonError(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function safeQuestions(questions) {
  return questions.map((item) => ({
    id: item.id,
    question: item.question,
    options: item.options,
    skill: item.skill,
    difficulty: item.difficulty,
  }));
}

function extractJson(content) {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(cleaned);
}

async function callGroq(messages, temperature = 0.3) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        temperature,
        response_format: { type: "json_object" },
        messages,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Groq error:", data);
    throw new Error("The AI assessment service is temporarily unavailable.");
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("The AI service returned an empty response.");
  }

  return extractJson(content);
}

async function generateQuestions(job, student) {
  const studentSkills = Array.isArray(student?.profile?.student?.skills)
    ? student.profile.student.skills
        .map((item) =>
          typeof item === "string" ? item : item?.name || item?.skill || "",
        )
        .filter(Boolean)
    : [];

  const jobContext = {
    title: job.title,
    industry: job.industry,
    description: job.description,
    responsibilities: job.responsibilities || [],
    requiredSkills: job.requiredSkills || [],
    preferredSkills: job.preferredSkills || [],
    experienceLevel: job.experienceLevel,
    employmentType: job.employmentType,
  };

  const prompt = `
Create exactly ${QUESTION_COUNT} job-specific multiple-choice skill assessment questions.

JOB:
${JSON.stringify(jobContext)}

STUDENT SKILLS:
${JSON.stringify(studentSkills)}

Requirements:
- Questions must assess practical knowledge relevant to this exact job.
- Prioritize required skills, then preferred skills.
- Use a balanced mix of Easy, Medium, and Hard difficulty.
- Every question must have exactly four distinct options.
- There must be exactly one correct option.
- correctAnswer must be the zero-based option index (0, 1, 2, or 3).
- Keep explanations concise and technically accurate.
- Do not include personal information.
- Avoid duplicate questions.
- Return valid JSON only, in this exact shape:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "skill": "Skill name",
      "difficulty": "Easy",
      "explanation": "Why the answer is correct"
    }
  ]
}
`;

  const generated = await callGroq([
    {
      role: "system",
      content:
        "You are a technical hiring assessment designer. Generate fair, job-relevant questions and follow the requested JSON schema exactly.",
    },
    { role: "user", content: prompt },
  ]);

  if (
    !Array.isArray(generated.questions) ||
    generated.questions.length !== QUESTION_COUNT
  ) {
    throw new Error("AI did not generate the required number of questions.");
  }

  return generated.questions.map((item, index) => {
    if (
      typeof item.question !== "string" ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      !Number.isInteger(item.correctAnswer) ||
      item.correctAnswer < 0 ||
      item.correctAnswer > 3 ||
      typeof item.skill !== "string"
    ) {
      throw new Error(
        `AI generated an invalid question at position ${index + 1}.`,
      );
    }

    const difficulty = ["Easy", "Medium", "Hard"].includes(item.difficulty)
      ? item.difficulty
      : "Medium";

    return {
      id: `q${index + 1}`,
      question: item.question.trim(),
      options: item.options.map((option) => String(option)),
      correctAnswer: item.correctAnswer,
      skill: item.skill.trim(),
      difficulty,
      explanation: String(item.explanation || ""),
    };
  });
}

async function generateFeedback({
  score,
  skills,
  correctAnswers,
  totalQuestions,
}) {
  try {
    const feedback = await callGroq([
      {
        role: "system",
        content:
          "You are a technical assessment coach. Return concise, constructive feedback as valid JSON.",
      },
      {
        role: "user",
        content: `
Analyze this completed job-specific assessment.

Score: ${score}%
Correct answers: ${correctAnswers}/${totalQuestions}
Skill performance: ${JSON.stringify(skills)}

Return JSON with:
{
  "summary": "A concise overall performance summary",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Specific improvement 1", "Specific improvement 2"],
  "feedback": "A useful paragraph with actionable advice",
  "recommendation": "A short learning recommendation"
}

Do not invent experience or qualifications. Base feedback only on the supplied assessment scores.
`,
      },
    ]);

    return {
      summary: String(feedback.summary || ""),
      strengths: Array.isArray(feedback.strengths)
        ? feedback.strengths.map(String).slice(0, 5)
        : [],
      improvements: Array.isArray(feedback.improvements)
        ? feedback.improvements.map(String).slice(0, 5)
        : [],
      feedback: String(feedback.feedback || ""),
      recommendation: String(feedback.recommendation || ""),
    };
  } catch (error) {
    console.error("Assessment feedback generation failed:", error);

    return {
      summary: `You answered ${correctAnswers} out of ${totalQuestions} questions correctly.`,
      strengths: skills
        .filter((item) => item.score >= 80)
        .map((item) => item.name),
      improvements: skills
        .filter((item) => item.score < 70)
        .map((item) => item.name),
      feedback:
        "Review the skill areas shown below and practise the topics where your score was lower.",
      recommendation:
        "Use the skill breakdown to guide your next study session.",
    };
  }
}

async function finalizeAssessment(
  assessment,
  submittedAnswers,
  expired = false,
) {
  if (assessment.result) {
    return assessment.result;
  }

  const answerMap = submittedAnswers || {};
  let correctAnswers = 0;

  const skillTotals = new Map();

  for (const question of assessment.questions) {
    const selectedAnswer = answerMap[question.id];
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) correctAnswers += 1;

    const skill = question.skill || "General";
    const current = skillTotals.get(skill) || { total: 0, correct: 0 };

    current.total += 1;
    if (isCorrect) current.correct += 1;

    skillTotals.set(skill, current);
  }

  const totalQuestions = assessment.questions.length;
  const score = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  const skills = Array.from(skillTotals.entries()).map(([name, data]) => {
    const skillScore = Math.round((data.correct / data.total) * 100);

    return {
      name,
      score: skillScore,
      type:
        skillScore >= 80
          ? "strong"
          : skillScore < 60
            ? "improvement"
            : "normal",
    };
  });

  const submittedAt = new Date();
  const elapsedSeconds = Math.max(
    0,
    Math.floor((submittedAt.getTime() - assessment.startedAt.getTime()) / 1000),
  );

  const timeTaken = Math.min(assessment.durationSeconds, elapsedSeconds);

  const feedback = await generateFeedback({
    score,
    skills,
    correctAnswers,
    totalQuestions,
  });

  const application = await Application.findById(assessment.application)
    .select("analysis.score")
    .lean();

  const resumeMatch = Number(application?.analysis?.score ?? 0);

  const result = {
    correctAnswers,
    totalQuestions,
    incorrectAnswers: totalQuestions - correctAnswers,
    score,
    timeTaken,
    resumeMatch,
    skills,
    ...feedback,
    expired,
    submittedAt,
  };

  assessment.answers = answerMap;
  assessment.status = expired ? "expired" : "submitted";
  assessment.submittedAt = submittedAt;
  assessment.result = result;

  await assessment.save();

  return result;
}

async function getStudentAndJob(request, context) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: jsonError("Please sign in to continue.", 401) };
  }

  if (user.role !== "student") {
    return {
      error: jsonError("Only student accounts can take this assessment.", 403),
    };
  }

  const params = await context.params;
  const jobId = params?.id;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return { error: jsonError("Invalid job ID.", 400) };
  }

  await connectDB();

  const [student, job] = await Promise.all([
    User.findById(user._id).select("profile role").lean(),
    Job.findById(jobId).lean(),
  ]);

  if (!student || !job) {
    return { error: jsonError("Job or student profile not found.", 404) };
  }

  const application = await Application.findOne({
    student: user._id,
    job: jobId,
  }).select("_id analysis.score");

  if (!application) {
    return {
      error: jsonError(
        "Apply for this job before starting its assessment.",
        403,
      ),
    };
  }

  if (job.requireSkillAssessment === false) {
    return {
      error: jsonError("This job does not require a skill assessment.", 400),
    };
  }

  return { user, student, job, application };
}

export async function GET(request, context) {
  try {
    const auth = await getStudentAndJob(request, context);
    if (auth.error) return auth.error;

    const { user, student, job, application } = auth;

    let assessment = await Assessment.findOne({
      student: user._id,
      job: job._id,
    });

    if (
      assessment?.status === "in_progress" &&
      Date.now() >= assessment.expiresAt.getTime()
    ) {
      await finalizeAssessment(
        assessment,
        Object.fromEntries(assessment.answers || []),
        true,
      );
    }

    if (
      assessment?.status === "submitted" ||
      assessment?.status === "expired"
    ) {
      return NextResponse.json({
        success: true,
        status: assessment.status,
        result: assessment.result,
        job: { title: job.title },
      });
    }

    if (!assessment) {
      const questions = await generateQuestions(job, student);
      const startedAt = new Date();

      try {
        assessment = await Assessment.create({
          student: user._id,
          job: job._id,
          application: application._id,
          questions,
          answers: {},
          startedAt,
          expiresAt: new Date(startedAt.getTime() + DURATION_SECONDS * 1000),
          durationSeconds: DURATION_SECONDS,
          status: "in_progress",
        });
      } catch (createError) {
        // Another simultaneous request may have created the assessment.
        if (createError.code === 11000) {
          assessment = await Assessment.findOne({
            student: user._id,
            job: job._id,
          });

          // If no matching assessment exists, this was a different
          // duplicate-key error. Let the outer catch handle it.
          if (!assessment) {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: "in_progress",
      assessment: {
        questions: safeQuestions(assessment.questions),
        startedAt: assessment.startedAt,
        expiresAt: assessment.expiresAt,
        durationSeconds: assessment.durationSeconds,
        answers: Object.fromEntries(assessment.answers || []),
      },
      job: { title: job.title },
    });
  } catch (error) {
    console.error("GET assessment error:", error);
    return jsonError(error.message || "Unable to load the assessment.", 500);
  }
}

export async function POST(request, context) {
  try {
    const auth = await getStudentAndJob(request, context);
    if (auth.error) return auth.error;

    const { user, job } = auth;
    const body = await request.json().catch(() => ({}));
    const submittedAnswers = body.answers;

    if (
      !submittedAnswers ||
      typeof submittedAnswers !== "object" ||
      Array.isArray(submittedAnswers)
    ) {
      return jsonError("Please submit your selected answers.", 400);
    }

    const assessment = await Assessment.findOne({
      student: user._id,
      job: job._id,
    }).select("+questions.correctAnswer +questions.explanation");

    if (!assessment) {
      return jsonError("Assessment not found. Please reload the page.", 404);
    }

    if (assessment.result) {
      return NextResponse.json({
        success: true,
        status: assessment.status,
        result: assessment.result,
      });
    }

    if (assessment.status !== "in_progress") {
      return jsonError("This assessment has already been submitted.", 409);
    }

    const isExpired = Date.now() >= assessment.expiresAt.getTime();

    const validAnswers = {};

    for (const question of assessment.questions) {
      const value = submittedAnswers[question.id];

      if (
        Number.isInteger(value) &&
        value >= 0 &&
        value < question.options.length
      ) {
        validAnswers[question.id] = value;
      }
    }

    const result = await finalizeAssessment(
      assessment,
      validAnswers,
      isExpired,
    );

    return NextResponse.json({
      success: true,
      status: assessment.status,
      result,
    });
  } catch (error) {
    console.error("POST assessment error:", error);
    return jsonError(error.message || "Unable to submit the assessment.", 500);
  }
}
