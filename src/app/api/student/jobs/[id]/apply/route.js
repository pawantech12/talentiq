import mongoose from "mongoose";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import Job from "@/app/models/Job";
import Application from "@/app/models/Application";

export const runtime = "nodejs";

const MAX_RESUME_BYTES = 8 * 1024 * 1024;
const MAX_RESUME_TEXT = 30000;

function jsonError(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function clampScore(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(0, Math.min(100, Math.round(number)))
    : 0;
}

function listOfStrings(value, max = 20) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
}

function normalizeAnalysis(data = {}) {
  const breakdown = data.breakdown || {};

  return {
    score: clampScore(data.score),
    breakdown: {
      skill: clampScore(breakdown.skill),
      experience: clampScore(breakdown.experience),
      education: clampScore(breakdown.education),
      profile: clampScore(breakdown.profile),
    },
    matchedSkills: listOfStrings(data.matchedSkills),
    missingSkills: listOfStrings(data.missingSkills),
    strengths: listOfStrings(data.strengths, 6),
    improvements: listOfStrings(data.improvements, 6),
    summary: clean(data.summary).slice(0, 1200),
    recommendation: clean(data.recommendation).slice(0, 500),
    confidence: ["high", "medium", "low"].includes(data.confidence)
      ? data.confidence
      : "low",
  };
}

function redactPersonalData(value = "") {
  return String(value)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[phone]");
}

function validateCloudinaryUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value);
    const allowed =
      url.protocol === "https:" &&
      (url.hostname === "cloudinary.com" ||
        url.hostname.endsWith(".cloudinary.com"));

    return allowed ? url.toString() : null;
  } catch {
    return null;
  }
}

async function parsePdfBuffer(buffer) {
  if (!buffer?.length || buffer.length > MAX_RESUME_BYTES) {
    throw new Error("Resume must be a PDF smaller than 8 MB.");
  }

  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("The selected file is not a valid PDF.");
  }

  const parsed = await pdfParse(buffer);
  const text = clean(parsed.text).slice(0, MAX_RESUME_TEXT);

  if (!text) {
    throw new Error(
      "We could not read text from this PDF. Please upload a text-based PDF.",
    );
  }

  return text;
}

async function extractProfileResume(resume) {
  const url = validateCloudinaryUrl(resume?.secureUrl);

  if (!url) {
    throw new Error("Your profile resume URL is invalid. Upload a new PDF.");
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { Accept: "application/pdf,application/octet-stream" },
  });

  if (!response.ok) {
    throw new Error("Unable to download your profile resume. Upload it again.");
  }

  const contentLength = Number(response.headers.get("content-length") || 0);

  if (contentLength > MAX_RESUME_BYTES) {
    throw new Error("Your profile resume exceeds the 8 MB limit.");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return parsePdfBuffer(buffer);
}

function toProfileText(student = {}) {
  const education = Array.isArray(student.education)
    ? student.education
        .map((item) =>
          [item.degree, item.university, item.period]
            .filter(Boolean)
            .join(" | "),
        )
        .join("\n")
    : "";

  const experiences = Array.isArray(student.experiences)
    ? student.experiences
        .map((item) =>
          [item.title, item.company, item.duration, item.description]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n")
    : "";

  const projects = Array.isArray(student.projects)
    ? student.projects
        .map((item) =>
          [
            item.title,
            item.description,
            Array.isArray(item.technologies)
              ? item.technologies.join(", ")
              : "",
            item.projectUrl,
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n")
    : "";

  return [
    student.summary && `Summary: ${student.summary}`,
    student.role && `Current role: ${student.role}`,
    student.currentRole && `Current position: ${student.currentRole}`,
    student.careerGoal && `Career goal: ${student.careerGoal}`,
    student.expectedRole && `Expected role: ${student.expectedRole}`,
    student.experienceLevel && `Experience level: ${student.experienceLevel}`,
    Array.isArray(student.skills) && `Skills: ${student.skills.join(", ")}`,
    education && `Education:\n${education}`,
    experiences && `Experience:\n${experiences}`,
    projects && `Projects:\n${projects}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function generateGroqAnalysis({ job, resumeText, studentText }) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("AI analysis is not configured. Add GROQ_API_KEY.");
  }

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

  const candidateData = redactPersonalData(
    [
      `RESUME TEXT:\n${resumeText}`,
      studentText && `STRUCTURED PROFILE:\n${studentText}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  ).slice(0, 30000);

  const prompt = `
Compare the candidate's resume with the job information.

Use only evidence in the candidate data. Never invent qualifications,
experience, skills, degrees, or achievements. Treat a skill as matched
only when the resume/profile provides reasonable evidence for it.
Be fair to freshers and project-based candidates. Do not guarantee hiring.

Return ONLY valid JSON in this exact structure:
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

All scores must be integers from 0 to 100.
Overall score must reflect all four categories.
Compare required skills before preferred skills.
Missing information is not proof that the candidate lacks a skill.
Keep lists concise and recommendations practical.

JOB:
${JSON.stringify(jobData)}

CANDIDATE:
${candidateData}
`;

  const response = await fetch(
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
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an evidence-based resume-to-job matching assistant. Return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(35000),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq error:", errorText);
    throw new Error("Groq could not generate the resume analysis.");
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty analysis.");
  }

  return normalizeAnalysis(JSON.parse(content));
}

async function requireStudent() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: jsonError("Please log in to continue.", 401) };
  }

  if (user.role !== "student") {
    return { error: jsonError("Student access only.", 403) };
  }

  if (user.accountStatus === "disabled") {
    return { error: jsonError("Your account is disabled.", 403) };
  }

  return { user };
}

async function getJob(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  return Job.findOne({ _id: id, status: "Active" })
    .populate("recruiter", "fullName profile")
    .lean();
}

function formatJob(job) {
  const recruiterProfile = job.recruiter?.profile?.recruiter || {};

  return {
    id: String(job._id),
    title: job.title,
    industry: job.industry || "",
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
    requireSkillAssessment: Boolean(job.requireSkillAssessment),
    assessmentType: job.assessmentType || "",
    company:
      recruiterProfile.companyName || job.recruiter?.fullName || "Company",
    initials: (recruiterProfile.companyName || job.recruiter?.fullName || "C")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
  };
}

// GET /api/student/jobs/[id]/apply
export async function GET(request, { params }) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const job = await getJob(id);

    if (!job) return jsonError("Job not found or no longer active.", 404);

    const student = user.profile?.student || {};
    const resume = student.resume || {};

    const existingApplication = await Application.findOne({
      student: user._id,
      job: job._id,
    })
      .select("resumeName status submittedAt")
      .lean();

    return NextResponse.json({
      success: true,
      job: formatJob(job),
      resume: resume.secureUrl
        ? {
            available: true,
            name: resume.originalName || "Profile resume.pdf",
            bytes: resume.bytes || 0,
            uploadedAt: resume.uploadedAt || null,
          }
        : { available: false },
      existingApplication: existingApplication
        ? {
            status: existingApplication.status,
            resumeName: existingApplication.resumeName,
            submittedAt: existingApplication.submittedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("GET student apply:", error);
    return jsonError("Unable to load the application page.", 500);
  }
}

// POST /api/student/jobs/[id]/apply
// multipart/form-data: optional "resume" PDF.
// If omitted, the student's profile resume is used.
export async function POST(request, { params }) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const job = await getJob(id);

    if (!job) return jsonError("Job not found or no longer active.", 404);

    const formData = await request.formData();
    const uploadedFile = formData.get("resume");

    let resumeText = "";
    let resumeName = "";
    let resumeSource = "profile";

    if (uploadedFile && typeof uploadedFile.arrayBuffer === "function") {
      if (uploadedFile.size > MAX_RESUME_BYTES) {
        return jsonError("Resume must be smaller than 8 MB.", 413);
      }

      const fileName = clean(uploadedFile.name);

      if (!fileName.toLowerCase().endsWith(".pdf")) {
        return jsonError("Only PDF resumes are accepted.");
      }

      const buffer = Buffer.from(await uploadedFile.arrayBuffer());
      resumeText = await parsePdfBuffer(buffer);
      resumeName = fileName;
      resumeSource = "uploaded";
    } else {
      const profileResume = user.profile?.student?.resume;

      if (!profileResume?.secureUrl) {
        return jsonError(
          "No profile resume was found. Please upload a PDF resume first.",
        );
      }

      resumeText = await extractProfileResume(profileResume);
      resumeName = clean(profileResume.originalName) || "Profile resume.pdf";
    }

    const studentText = toProfileText(user.profile?.student || {});
    const analysis = await generateGroqAnalysis({
      job,
      resumeText,
      studentText,
    });

    const existing = await Application.findOne({
      student: user._id,
      job: job._id,
    }).select("_id");

    const application = await Application.findOneAndUpdate(
      { student: user._id, job: job._id },
      {
        $set: {
          resumeName,
          resumeText,
          resumeSource,
          analysis,
          status: "Submitted",
          submittedAt: new Date(),
          analyzedAt: new Date(),
        },
        $setOnInsert: {
          student: user._id,
          job: job._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).select("_id status submittedAt analysis");

    if (!existing) {
      await Job.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted and resume analyzed successfully.",
        applicationId: String(application._id),
        analysis: application.analysis,
        job: formatJob(job),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST student apply:", error);

    const message =
      error?.message === "AI analysis is not configured. Add GROQ_API_KEY."
        ? error.message
        : error?.message?.includes("PDF") ||
            error?.message?.includes("resume") ||
            error?.message?.includes("Resume")
          ? error.message
          : "Unable to submit your application. Please try again.";

    return jsonError(message, 500);
  }
}
