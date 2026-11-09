import mongoose from "mongoose";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

import { connectDB } from "@/lib/mongoose";
import Job from "@/app/models/Job";
import { getAuthenticatedUser } from "@/lib/profile-auth";

export const runtime = "nodejs";

const MAX_RESUME_BYTES = 8 * 1024 * 1024;
const MAX_PROFILE_TEXT = 14000;

const clampScore = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(0, Math.min(100, Math.round(number)))
    : 0;
};

const firstText = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
};

const cleanString = (value) => (typeof value === "string" ? value.trim() : "");

const toText = (value) => {
  if (typeof value === "string") return value.trim();

  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join("\n");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => !["_id", "id"].includes(key))
      .map(([key, item]) => {
        const text = toText(item);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
};

const getStringList = (...values) => {
  const result = [];

  for (const value of values) {
    if (!Array.isArray(value)) continue;

    for (const item of value) {
      const text =
        typeof item === "string"
          ? item.trim()
          : firstText(item?.name, item?.title, item?.skill);

      if (text && !result.includes(text)) {
        result.push(text);
      }
    }
  }

  return result;
};

// Do not send email addresses or phone numbers to the AI provider.
function redactPersonalData(value = "") {
  return String(value)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[phone]");
}

/**
 * Only fetch resume URLs hosted by Cloudinary.
 * This avoids accepting arbitrary URLs from profile data.
 */
function validateCloudinaryUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value);

    const allowedHost =
      url.hostname === "cloudinary.com" ||
      url.hostname.endsWith(".cloudinary.com");

    if (url.protocol !== "https:" || !allowedHost) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Download and extract text from the student's uploaded PDF.
 *
 * PDF parsing happens on the server. The PDF itself is never
 * sent to the browser or directly to Groq.
 */
async function extractCloudinaryPdf(secureUrl) {
  const url = validateCloudinaryUrl(secureUrl);

  if (!url) {
    throw new Error("Invalid or unsupported resume URL.");
  }

  const response = await fetch(url, {
    method: "GET",
    signal: AbortSignal.timeout(20000),
    headers: {
      Accept: "application/pdf,application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Unable to download resume from Cloudinary (${response.status}).`,
    );
  }

  const contentLength = Number(response.headers.get("content-length") || 0);

  if (contentLength > MAX_RESUME_BYTES) {
    throw new Error("Resume PDF is larger than the allowed size.");
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (!buffer.length || buffer.length > MAX_RESUME_BYTES) {
    throw new Error("Resume PDF is empty or too large.");
  }

  // Check the PDF file signature rather than trusting its URL.
  const signature = buffer.subarray(0, 5).toString("ascii");

  if (signature !== "%PDF-") {
    throw new Error("The uploaded resume could not be recognized as a PDF.");
  }

  const parsedPdf = await pdfParse(buffer);

  return cleanString(parsedPdf.text);
}

/**
 * Convert the actual structure of profile.student into
 * readable information for the AI model.
 */
function getStructuredStudentData(user) {
  const root = user.profile || {};
  const student = root.student || {};
  const resume = student.resume || root.resume || {};

  const skills = getStringList(student.skills, resume.skills, root.skills);

  // Your actual database stores education as an array of objects.
  const education = toText(
    student.education ||
      student.educationDetails ||
      resume.education ||
      root.education,
  );

  // Your actual database stores work history in experiences[].
  const experiences = toText(
    student.experiences ||
      student.experience ||
      student.experienceDetails ||
      resume.experiences ||
      resume.experience ||
      root.experiences,
  );

  // Your actual database stores projects as objects in projects[].
  const projects = toText(student.projects || resume.projects || root.projects);

  const projectTechnologies = getStringList(
    ...(Array.isArray(student.projects)
      ? student.projects.map((project) => project.technologies)
      : []),
  );

  const summary = firstText(
    student.summary,
    student.about,
    student.objective,
    resume.summary,
    root.summary,
    root.about,
  );

  const careerDetails = [
    firstText(student.role) && `Current role: ${student.role}`,

    firstText(student.currentRole) &&
      `Current position: ${student.currentRole}`,

    firstText(student.careerGoal) && `Career goal: ${student.careerGoal}`,

    firstText(student.expectedRole) && `Expected role: ${student.expectedRole}`,

    firstText(student.experienceLevel) &&
      `Candidate experience level: ${student.experienceLevel}`,

    firstText(student.preferredLocation) &&
      `Preferred location: ${student.preferredLocation}`,

    firstText(student.location) && `Current location: ${student.location}`,
  ]
    .filter(Boolean)
    .join("\n");

  const structuredText = [
    summary && `Profile summary:\n${summary}`,

    careerDetails && `Career information:\n${careerDetails}`,

    skills.length && `Skills:\n${skills.join(", ")}`,

    projectTechnologies.length &&
      `Project technologies:\n${projectTechnologies.join(", ")}`,

    education && `Education:\n${education}`,

    experiences && `Work experience:\n${experiences}`,

    projects && `Projects:\n${projects}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    resume,
    structuredText,
    skills,
  };
}

/**
 * Normalize the Groq response before returning it to the UI.
 */
function normalizeAnalysis(data) {
  const breakdown = data.breakdown || {};

  const skill = clampScore(breakdown.skill);
  const experience = clampScore(breakdown.experience);
  const education = clampScore(breakdown.education);
  const profile = clampScore(breakdown.profile);

  return {
    score: clampScore(data.score),

    breakdown: {
      skill,
      experience,
      education,
      profile,
    },

    matchedSkills: Array.isArray(data.matchedSkills)
      ? data.matchedSkills
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [],

    missingSkills: Array.isArray(data.missingSkills)
      ? data.missingSkills
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [],

    strengths: Array.isArray(data.strengths)
      ? data.strengths.filter((item) => typeof item === "string").slice(0, 6)
      : [],

    improvements: Array.isArray(data.improvements)
      ? data.improvements.filter((item) => typeof item === "string").slice(0, 6)
      : [],

    summary: String(data.summary || "").slice(0, 1200),

    recommendation: String(data.recommendation || "").slice(0, 500),

    confidence: ["high", "medium", "low"].includes(data.confidence)
      ? data.confidence
      : "low",
  };
}

export async function POST(request, { params }) {
  try {
    // 1. Authenticate the student.
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in.",
        },
        { status: 401 },
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        {
          success: false,
          message: "Student access only.",
        },
        { status: 403 },
      );
    }

    // 2. Validate job ID.
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid job ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // 3. Load only active jobs.
    const job = await Job.findOne({
      _id: id,
      status: "Active",
    }).lean();

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found or no longer active.",
        },
        { status: 404 },
      );
    }

    // 4. Read structured student profile information.
    const studentData = getStructuredStudentData(user);

    // 5. Extract the actual uploaded Cloudinary PDF.
    let extractedResumeText = "";
    let resumeExtractionFailed = false;

    const existingParsedText = firstText(
      studentData.resume.parsedText,
      studentData.resume.extractedText,
      studentData.resume.text,
      studentData.resume.content,
      user.profile?.student?.resumeText,
      user.profile?.student?.parsedResumeText,
      user.profile?.resumeText,
      user.profile?.parsedResumeText,
    );

    if (existingParsedText) {
      extractedResumeText = existingParsedText;
    } else if (studentData.resume.secureUrl) {
      try {
        extractedResumeText = await extractCloudinaryPdf(
          studentData.resume.secureUrl,
        );
      } catch (error) {
        resumeExtractionFailed = true;

        console.error("Student resume PDF extraction failed:", error.message);
      }
    }

    // 6. Combine PDF text with structured profile data.
    const candidateText = redactPersonalData(
      [
        extractedResumeText && `RESUME CONTENT:\n${extractedResumeText}`,

        studentData.structuredText &&
          `STRUCTURED STUDENT PROFILE:\n${studentData.structuredText}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    ).slice(0, MAX_PROFILE_TEXT);

    if (!candidateText.trim()) {
      return NextResponse.json(
        {
          success: false,
          code: "PROFILE_DATA_MISSING",
          message:
            "Your profile does not contain readable resume text or structured career information. Please upload a PDF resume and complete your profile.",
        },
        { status: 422 },
      );
    }

    // 7. Check Groq configuration.
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY is not configured.");

      return NextResponse.json(
        {
          success: false,
          message: "AI matching is not configured.",
        },
        { status: 503 },
      );
    }

    // 8. Prepare job information.
    const jobData = {
      title: job.title,
      industry: job.industry,
      location: job.location,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      description: job.description,
      responsibilities: job.responsibilities,
      requiredSkills: job.requiredSkills || [],
      preferredSkills: job.preferredSkills || [],
      educationRequirement: job.educationRequirement || "",
    };

    // 9. Ask Groq for evidence-based matching.
    const prompt = `
You are an expert, evidence-based career matching assistant.

Your task is to compare a student's resume and structured profile
against a specific job.

IMPORTANT RULES:
1. Only use evidence explicitly present in the candidate information.
2. Never invent skills, degrees, certifications, experience or achievements.
3. Missing information is not proof that the candidate lacks a skill.
4. Distinguish between skills explicitly demonstrated and skills merely listed.
5. Consider relevant projects, technologies, internships and work experience.
6. Consider the candidate's career goal and preferred location.
7. Do not include personal contact details.
8. Explain important limitations in the summary.
9. Do not guarantee that the candidate will be hired.
10. Be fair to freshers and candidates with project-based experience.

Return ONLY valid JSON using this exact structure:

{
  "score": 0,
  "breakdown": {
    "skill": 0,
    "experience": 0,
    "education": 0,
    "profile": 0
  },
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "improvements": [],
  "summary": "",
  "recommendation": "",
  "confidence": "low"
}

SCORING:
- All scores must be integers between 0 and 100.
- Overall score should reflect all four breakdown categories.
- Skill: compare required skills first, then preferred skills.
- Experience: compare the job experience level with actual work, internship and project evidence.
- Education: compare the education requirement with the candidate's stated education.
- Profile: compare relevant projects, responsibilities, technologies and career direction.
- Do not automatically penalize a fresher for lacking professional experience if relevant project evidence exists.
- Do not award a high score simply because a technology appears in a skill list.
- Keep matchedSkills and missingSkills concise and job-specific.
- Improvements should be practical and achievable.
- Use low confidence if the candidate's information is limited or PDF extraction failed.

JOB INFORMATION:
${JSON.stringify(jobData)}

STUDENT RESUME AND PROFILE:
${candidateText}

PDF EXTRACTION STATUS:
${resumeExtractionFailed ? "The PDF could not be extracted. Use only the structured profile information." : "Resume text was available or successfully extracted."}
`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",

          temperature: 0.2,
          max_tokens: 1800,

          response_format: {
            type: "json_object",
          },

          messages: [
            {
              role: "system",
              content:
                "You are a careful resume-to-job matching assistant. Use only candidate evidence. Return valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),

        signal: AbortSignal.timeout(30000),
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();

      console.error("Groq API error:", errorText);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to generate AI job matching right now.",
        },
        { status: 502 },
      );
    }

    // 10. Parse and validate the AI result.
    const groqData = await groqResponse.json();

    const content = groqData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    const parsed = JSON.parse(content);
    const analysis = normalizeAnalysis(parsed);

    // 11. Return the result to the student dashboard.
    return NextResponse.json({
      success: true,
      analysis,
      generatedAt: new Date().toISOString(),
      hasResumeText: Boolean(extractedResumeText),
      resumeExtractionFailed,
    });
  } catch (error) {
    console.error("POST student job AI match:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate AI match. Please try again.",
      },
      { status: 500 },
    );
  }
}
