import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import User from "@/app/models/User";
import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";
import Interview from "@/app/models/Interview";

export const runtime = "nodejs";
export const maxDuration = 60;

const DURATION_SECONDS = 10 * 60;
const QUESTION_COUNT = 8;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function jsonError(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function parseJson(content) {
  if (!content) throw new Error("The AI returned an empty response.");
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

async function askGroq(messages, maxTokens = 5000) {
  if (!process.env.GROQ_API_KEY)
    throw new Error("GROQ_API_KEY is not configured.");
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages,
    }),
    signal: AbortSignal.timeout(55000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Groq request failed.");
  }
  return parseJson(data?.choices?.[0]?.message?.content);
}

function cleanStrings(value, max = 5) {
  return Array.isArray(value)
    ? value
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, max)
    : [];
}

function safeInterview(interview) {
  return {
    id: String(interview._id),
    status: interview.status,
    questions: interview.questions.map((q) => ({
      id: q.id,
      category: q.category,
      question: q.question,
      tip: q.tip,
      skill: q.skill,
    })),
    answers: Object.fromEntries(interview.answers || []),
    startedAt: interview.startedAt,
    expiresAt: interview.expiresAt,
    durationSeconds: interview.durationSeconds,
    submittedAt: interview.submittedAt,
  };
}

async function getContext(request, params) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: jsonError("Please sign in to continue.", 401) };
  if (user.role !== "student")
    return {
      error: jsonError("Only student accounts can access interviews.", 403),
    };

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return { error: jsonError("Invalid job ID.", 400) };

  await connectDB();
  const [student, job] = await Promise.all([
    User.findById(user._id).select("fullName role profile"),
    Job.findById(id).populate("recruiter", "fullName"),
  ]);
  if (!student)
    return { error: jsonError("Student account was not found.", 404) };
  if (!job) return { error: jsonError("Job was not found.", 404) };

  const application = await Application.findOne({
    student: student._id,
    job: job._id,
  }).select("_id status");
  if (!application)
    return {
      error: jsonError(
        "Apply for this job before starting its mock interview.",
        403,
      ),
    };

  if (job.requireSkillAssessment) {
    const assessment = await Assessment.findOne({
      student: student._id,
      job: job._id,
      status: "submitted",
    }).select("_id status");
    if (!assessment) {
      return {
        error: jsonError(
          "Complete the required skill assessment before preparing for this interview.",
          403,
        ),
      };
    }
  }

  return { student, job, application };
}

async function generateQuestions(student, job) {
  const profile = student.profile?.student || {};
  const skills = Array.isArray(profile.skills)
    ? profile.skills
        .map((s) => (typeof s === "string" ? s : s?.name))
        .filter(Boolean)
        .slice(0, 30)
    : [];
  const jobContext = {
    title: job.title,
    industry: job.industry,
    location: job.location,
    experienceLevel: job.experienceLevel,
    description: job.description,
    responsibilities: job.responsibilities,
    requiredSkills: job.requiredSkills || [],
    preferredSkills: job.preferredSkills || [],
    educationRequirement: job.educationRequirement,
    studentSkills: skills,
    studentExperienceLevel: profile.experienceLevel || "",
    studentCurrentRole: profile.currentRole || "",
    studentCareerGoal: profile.careerGoal || "",
  };

  const output = await askGroq(
    [
      {
        role: "system",
        content: `You are an experienced technical interviewer. Return valid JSON only with this exact shape:
{"questions":[{"id":"q1","category":"Technical Knowledge","question":"...","tip":"...","skill":"React"}, ...]}
Create exactly ${QUESTION_COUNT} clear, open-ended mock interview questions tailored to the job. Cover technical knowledge, problem solving, communication and role understanding. Questions must be answerable in text, progressively varied, not multiple choice, and appropriate for the stated experience level. Keep tips brief. Do not include answers or scoring.`,
      },
      { role: "user", content: JSON.stringify(jobContext) },
    ],
    4500,
  );

  if (
    !Array.isArray(output.questions) ||
    output.questions.length < QUESTION_COUNT
  ) {
    throw new Error(
      "Groq did not generate the required interview questions. Please try again.",
    );
  }
  return output.questions
    .slice(0, QUESTION_COUNT)
    .map((q, index) => ({
      id: `q${index + 1}`,
      category: String(q.category || "Technical Knowledge").slice(0, 60),
      question: String(q.question || "")
        .trim()
        .slice(0, 1200),
      tip: String(
        q.tip || "Explain your reasoning and include a practical example.",
      )
        .trim()
        .slice(0, 500),
      skill: String(q.skill || "General")
        .trim()
        .slice(0, 80),
    }))
    .filter((q) => q.question);
}

function buildFallbackEvaluation(questions, answers) {
  const answered = questions.filter(
    (q) => String(answers[q.id] || "").trim().length >= 25,
  ).length;
  const score = Math.round((answered / Math.max(questions.length, 1)) * 55);
  return {
    score,
    performanceLabel: score >= 45 ? "Good effort" : "Needs more practice",
    areas: [
      {
        name: "Technical Knowledge",
        score,
        feedback:
          "Review the role's core technologies and explain implementation choices with examples.",
      },
      {
        name: "Problem Solving",
        score,
        feedback:
          "Use a structured approach: clarify, investigate, solve, and validate.",
      },
      {
        name: "Communication",
        score,
        feedback: "Make answers concise, organized, and specific.",
      },
      {
        name: "Role Understanding",
        score,
        feedback:
          "Connect your answers to the job responsibilities and business needs.",
      },
    ],
    strengths: answered ? ["You attempted the interview questions."] : [],
    improvements: [
      "Add specific examples from projects or work.",
      "Explain the reasoning behind technical decisions.",
      "Practice giving structured, concise answers.",
    ],
    feedback:
      "The AI evaluation could not be completed, so this is a limited completion-based fallback rather than a full assessment. Please try again later for detailed feedback.",
    recommendations: [
      "Practice role-specific technical questions.",
      "Use the STAR method for behavioral examples.",
      "Explain trade-offs and decisions in practical scenarios.",
    ],
    answeredQuestions: answered,
    totalQuestions: questions.length,
    evaluationMode: "fallback",
  };
}

async function evaluateInterview(interview, job) {
  const answers = Object.fromEntries(interview.answers || []);
  const qa = interview.questions.map((q) => ({
    question: q.question,
    category: q.category,
    skill: q.skill,
    answer: String(answers[q.id] || "").trim(),
  }));

  try {
    const output = await askGroq(
      [
        {
          role: "system",
          content: `You are a fair, constructive senior interviewer evaluating a candidate's written mock interview. Evaluate substance, correctness, reasoning, relevance, examples and communication. Do not reward length alone. Missing answers should score poorly. Return valid JSON only:
{
 "score": 0,
 "performanceLabel": "Strong Performance",
 "areas":[{"name":"Technical Knowledge","score":0,"feedback":"..."},{"name":"Problem Solving","score":0,"feedback":"..."},{"name":"Communication","score":0,"feedback":"..."},{"name":"Role Understanding","score":0,"feedback":"..."}],
 "strengths":["..."],
 "improvements":["..."],
 "feedback":"A concise overall assessment...",
 "recommendations":["..."],
 "answeredQuestions":0,
 "totalQuestions":8
}
All scores must be integers from 0 to 100. Use exactly the four area names shown. Be specific to the candidate's answers and job. Avoid unsupported claims or percentile rankings.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            job: {
              title: job.title,
              description: job.description,
              responsibilities: job.responsibilities,
              requiredSkills: job.requiredSkills || [],
              preferredSkills: job.preferredSkills || [],
              experienceLevel: job.experienceLevel,
            },
            questionsAndAnswers: qa,
          }),
        },
      ],
      3500,
    );

    const areas = Array.isArray(output.areas) ? output.areas : [];
    const expected = [
      "Technical Knowledge",
      "Problem Solving",
      "Communication",
      "Role Understanding",
    ];
    const normalizedAreas = expected.map((name) => {
      const area = areas.find((item) => item.name === name) || {};
      return {
        name,
        score: Math.max(0, Math.min(100, Math.round(Number(area.score) || 0))),
        feedback: String(
          area.feedback || "Continue practicing this area.",
        ).slice(0, 600),
      };
    });
    const score = Math.max(
      0,
      Math.min(100, Math.round(Number(output.score) || 0)),
    );
    return {
      score,
      performanceLabel: String(
        output.performanceLabel ||
          (score >= 80
            ? "Strong Performance"
            : score >= 65
              ? "Good Performance"
              : "Needs Improvement"),
      ).slice(0, 60),
      areas: normalizedAreas,
      strengths: cleanStrings(output.strengths),
      improvements: cleanStrings(output.improvements),
      feedback: String(
        output.feedback || "Keep practicing with role-specific examples.",
      ).slice(0, 2500),
      recommendations: cleanStrings(output.recommendations, 6),
      answeredQuestions: qa.filter((item) => item.answer.length > 0).length,
      totalQuestions: interview.questions.length,
      evaluationMode: "groq",
    };
  } catch (error) {
    console.error("Groq interview evaluation failed:", error);
    return buildFallbackEvaluation(interview.questions, answers);
  }
}

async function finalizeInterview(interview, job, expired = false) {
  if (interview.status !== "in_progress") return interview;
  const result = await evaluateInterview(interview, job);
  interview.result = {
    ...result,
    timeTaken: Math.min(
      interview.durationSeconds,
      Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(interview.startedAt).getTime()) / 1000,
        ),
      ),
    ),
    date: new Date().toISOString(),
    jobTitle: job.title,
    company: job.recruiter?.fullName || "Company",
  };
  interview.status = expired ? "expired" : "submitted";
  interview.submittedAt = new Date();
  await interview.save();
  return interview;
}

export async function GET(request, { params }) {
  try {
    const context = await getContext(request, params);
    if (context.error) return context.error;
    const { student, job, application } = context;

    let interview = await Interview.findOne({
      student: student._id,
      job: job._id,
    });
    if (
      interview?.status === "in_progress" &&
      Date.now() >= new Date(interview.expiresAt).getTime()
    ) {
      interview = await finalizeInterview(interview, job, true);
    }
    if (interview) {
      return NextResponse.json({
        success: true,
        job: {
          id: String(job._id),
          title: job.title,
          company: job.recruiter?.fullName || "Company",
          location: job.location,
          type: job.employmentType,
          skills: job.requiredSkills || [],
        },
        interview: safeInterview(interview),
        result: interview.result || null,
      });
    }

    const questions = await generateQuestions(student, job);
    const startedAt = new Date();
    const newInterview = new Interview({
      student: student._id,
      job: job._id,
      application: application._id,
      questions,
      startedAt,
      expiresAt: new Date(startedAt.getTime() + DURATION_SECONDS * 1000),
      durationSeconds: DURATION_SECONDS,
    });

    try {
      await newInterview.save();
      interview = newInterview;
    } catch (error) {
      // Another tab/request may have created the unique student+job attempt.
      if (error.code !== 11000) throw error;
      interview = await Interview.findOne({
        student: student._id,
        job: job._id,
      });
      if (!interview) throw error;
    }

    return NextResponse.json({
      success: true,
      job: {
        id: String(job._id),
        title: job.title,
        company: job.recruiter?.fullName || "Company",
        location: job.location,
        type: job.employmentType,
        skills: job.requiredSkills || [],
      },
      interview: safeInterview(interview),
      result: interview.result || null,
    });
  } catch (error) {
    console.error("Interview GET error:", error);
    return jsonError(error.message || "Unable to load the interview.", 500);
  }
}

export async function POST(request, { params }) {
  try {
    const context = await getContext(request, params);
    if (context.error) return context.error;
    const { student, job } = context;

    const body = await request.json();
    const interview = await Interview.findOne({
      student: student._id,
      job: job._id,
    });
    if (!interview)
      return jsonError(
        "Interview session was not found. Open the interview start page first.",
        404,
      );

    if (interview.status !== "in_progress") {
      return NextResponse.json({
        success: true,
        interview: safeInterview(interview),
        result: interview.result,
      });
    }

    const isExpired = Date.now() >= new Date(interview.expiresAt).getTime();
    if (body.action !== "save" && body.action !== "submit") {
      return jsonError("Invalid interview action.");
    }

    if (
      body.answers &&
      typeof body.answers === "object" &&
      !Array.isArray(body.answers)
    ) {
      const validIds = new Set(interview.questions.map((q) => q.id));
      for (const [questionId, answer] of Object.entries(body.answers)) {
        if (validIds.has(questionId) && typeof answer === "string") {
          interview.answers.set(questionId, answer.slice(0, 3000));
        }
      }
    }

    if (body.action === "save" && !isExpired) {
      await interview.save();
      return NextResponse.json({
        success: true,
        interview: safeInterview(interview),
      });
    }

    await interview.save();
    const finalized = await finalizeInterview(interview, job, isExpired);
    return NextResponse.json({
      success: true,
      interview: safeInterview(finalized),
      result: finalized.result,
    });
  } catch (error) {
    console.error("Interview POST error:", error);
    return jsonError(error.message || "Unable to submit the interview.", 500);
  }
}
