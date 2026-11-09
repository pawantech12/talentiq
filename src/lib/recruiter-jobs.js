import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "./profile-auth";

export async function requireRecruiter() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 },
      ),
    };
  }
  if (user.role !== "recruiter") {
    return {
      response: NextResponse.json(
        { success: false, message: "Recruiter access only." },
        { status: 403 },
      ),
    };
  }
  return { user };
}

export function cleanText(value, max = 12000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function normalizeJobInput(body = {}) {
  const allowedEmployment = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
  ];
  const allowedExperience = ["0–3 Years", "3–5 Years", "5–8 Years", "8+ Years"];
  const status = ["Active", "Draft", "Closed"].includes(body.status)
    ? body.status
    : "Draft";

  const requiredSkills = Array.isArray(body.requiredSkills)
    ? [
        ...new Set(
          body.requiredSkills.map((x) => cleanText(x, 50)).filter(Boolean),
        ),
      ].slice(0, 12)
    : [];
  const preferredSkills = Array.isArray(body.preferredSkills)
    ? [
        ...new Set(
          body.preferredSkills.map((x) => cleanText(x, 50)).filter(Boolean),
        ),
      ].slice(0, 10)
    : [];

  const salaryMin =
    body.salaryMin === "" || body.salaryMin == null
      ? null
      : Number(body.salaryMin);
  const salaryMax =
    body.salaryMax === "" || body.salaryMax == null
      ? null
      : Number(body.salaryMax);

  return {
    title: cleanText(body.title, 120),
    industry: cleanText(body.industry, 100),
    location: cleanText(body.location, 150),
    employmentType: allowedEmployment.includes(body.employmentType)
      ? body.employmentType
      : "",
    experienceLevel: allowedExperience.includes(body.experienceLevel)
      ? body.experienceLevel
      : "",
    salaryMin: Number.isFinite(salaryMin) && salaryMin >= 0 ? salaryMin : null,
    salaryMax: Number.isFinite(salaryMax) && salaryMax >= 0 ? salaryMax : null,
    description: cleanText(body.description),
    responsibilities: cleanText(body.responsibilities),
    requiredSkills,
    preferredSkills,
    educationRequirement: cleanText(body.educationRequirement, 120),
    resumeSkillMatch: body.resumeSkillMatch === true,
    educationMatch: body.educationMatch === true,
    experienceMatch: body.experienceMatch === true,
    requireSkillAssessment: body.requireSkillAssessment === true,
    assessmentType:
      cleanText(body.assessmentType, 100) || "Job-Specific Skill Assessment",
    status,
  };
}

export function validateJob(job) {
  if (
    !job.title ||
    !job.location ||
    !job.employmentType ||
    !job.experienceLevel ||
    !job.description ||
    !job.responsibilities
  ) {
    return "Complete all required job fields.";
  }
  if (!job.requiredSkills.length) return "Add at least one required skill.";
  if (
    job.salaryMin !== null &&
    job.salaryMax !== null &&
    job.salaryMax < job.salaryMin
  ) {
    return "Maximum salary must be greater than or equal to minimum salary.";
  }
  return null;
}
