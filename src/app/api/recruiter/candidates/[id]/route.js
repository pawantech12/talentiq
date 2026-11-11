import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";

import User from "@/app/models/User";
import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorResponse = (message, status = 400) =>
  NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const cleanObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const dateLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAssessmentScore = (result) => {
  const value = firstValue(
    result?.score,
    result?.percentage,
    result?.totalPercentage,
    result?.overallScore,
    result?.percent,
  );

  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null;
};

const getExperience = (student) => {
  const direct = firstValue(
    student?.experienceLevel,
    student?.totalExperience,
    student?.experience,
    student?.yearsOfExperience,
  );

  if (typeof direct === "string") return direct;
  if (Number.isFinite(Number(direct))) return `${direct} Years Experience`;

  const history = asArray(student?.experienceHistory || student?.experience);
  if (!history.length) return "Not specified";

  return `${history.length} Experience Record${history.length === 1 ? "" : "s"}`;
};

const normalizeExperience = (student) => {
  const raw = asArray(
    student?.experienceHistory ||
      student?.workExperience ||
      student?.experiences ||
      student?.experience,
  );

  return raw.map((item) => {
    if (typeof item === "string") {
      return {
        title: item,
        company: "",
        duration: "",
        period: "",
        description: "",
      };
    }

    const start = firstValue(item?.startDate, item?.from, item?.start);
    const end = firstValue(
      item?.endDate,
      item?.to,
      item?.end,
      item?.isCurrent ? "Present" : "",
    );
    const duration = [
      dateLabel(start),
      end === "Present" ? "Present" : dateLabel(end),
    ]
      .filter(Boolean)
      .join(" – ");

    return {
      title: firstValue(
        item?.title,
        item?.position,
        item?.role,
        item?.jobTitle,
        "Experience",
      ),
      company: firstValue(
        item?.company,
        item?.companyName,
        item?.organization,
        "",
      ),
      duration: firstValue(item?.duration, duration, ""),
      period: firstValue(item?.period, item?.totalDuration, ""),
      description: firstValue(item?.description, item?.summary, ""),
    };
  });
};

const normalizeEducation = (student) => {
  const raw = asArray(
    student?.education || student?.educationHistory || student?.qualifications,
  );

  return raw.map((item) => {
    if (typeof item === "string") {
      return {
        degree: item,
        university: "",
        field: "",
        duration: "",
        current: false,
      };
    }

    return {
      degree: firstValue(
        item?.degree,
        item?.qualification,
        item?.course,
        item?.level,
        "Education",
      ),

      university: firstValue(
        item?.university,
        item?.institution,
        item?.college,
        item?.school,
        "",
      ),

      field: firstValue(item?.field, item?.specialization, item?.stream, ""),

      duration: firstValue(
        item?.period,
        item?.duration,
        [item?.startYear, item?.endYear].filter(Boolean).join(" – "),
        "",
      ),

      current: Boolean(
        item?.current || item?.isCurrent || item?.status === "Pursuing",
      ),
    };
  });
};

const normalizeAssessmentBreakdown = (result) => {
  const raw = firstValue(
    result?.skillScores,
    result?.breakdown,
    result?.skills,
    result?.bySkill,
  );

  if (Array.isArray(raw)) {
    return raw.map((item) => ({
      name: firstValue(item?.skill, item?.name, item?.label, "Skill"),
      score: Math.max(
        0,
        Math.min(
          100,
          Number(firstValue(item?.score, item?.percentage, 0)) || 0,
        ),
      ),
    }));
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([name, value]) => ({
      name,
      score: Math.max(
        0,
        Math.min(
          100,
          Number(
            typeof value === "object"
              ? firstValue(value?.score, value?.percentage, 0)
              : value,
          ) || 0,
        ),
      ),
    }));
  }

  return [];
};

export async function GET(request, { params }) {
  try {
    const authResult = await getAuthenticatedUser(request);
    const recruiter = authResult?.user || authResult;

    if (!recruiter?._id) {
      return errorResponse("Authentication required.", 401);
    }

    if (recruiter.role !== "recruiter") {
      return errorResponse("Recruiter access only.", 403);
    }

    if (recruiter.accountStatus === "disabled") {
      return errorResponse("Your account is disabled.", 403);
    }

    const { id: studentId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const applicationId = searchParams.get("applicationId");

    if (
      !mongoose.isValidObjectId(studentId) ||
      !mongoose.isValidObjectId(jobId) ||
      !mongoose.isValidObjectId(applicationId)
    ) {
      return errorResponse("Invalid candidate, job, or application ID.", 400);
    }

    await connectDB();

    const job = await Job.findOne({
      _id: jobId,
      recruiter: recruiter._id,
    })
      .select(
        "title industry location employmentType experienceLevel requiredSkills preferredSkills educationRequirement",
      )
      .lean();

    if (!job) {
      return errorResponse(
        "Job not found or you do not have access to it.",
        404,
      );
    }

    const application = await Application.findOne({
      _id: applicationId,
      job: jobId,
      student: studentId,
    })
      .select("+resumeText")
      .lean();

    if (!application) {
      return errorResponse(
        "Application not found for this candidate and job.",
        404,
      );
    }

    const studentUser = await User.findOne({
      _id: studentId,
      role: "student",
      accountStatus: { $ne: "disabled" },
    })
      .select("fullName email profile createdAt")
      .lean();

    if (!studentUser) {
      return errorResponse("Candidate account not found or unavailable.", 404);
    }

    const profile = cleanObject(studentUser.profile);
    const student = cleanObject(profile.student || profile);

    const assessment = await Assessment.findOne({
      student: studentId,
      job: jobId,
      application: applicationId,
    })
      .select(
        "status result submittedAt startedAt durationSeconds questions.skill",
      )
      .lean();

    const analysis = cleanObject(application.analysis);
    const breakdown = cleanObject(analysis.breakdown);

    const profileSkills = asArray(
      student.skills || student.technicalSkills || student.skillSet,
    );

    const jobSkills = [
      ...asArray(job.requiredSkills).map((name) => ({ name, required: true })),
      ...asArray(job.preferredSkills).map((name) => ({
        name,
        required: false,
      })),
    ];

    const skillNames = new Set(
      profileSkills.map((item) =>
        String(
          typeof item === "string" ? item : item?.name || item?.skill || "",
        ).toLowerCase(),
      ),
    );

    const skills = jobSkills.length
      ? jobSkills.map((skill) => ({
          ...skill,
          matched:
            skillNames.has(skill.name.toLowerCase()) ||
            asArray(analysis.matchedSkills).some(
              (matched) =>
                String(matched).toLowerCase() === skill.name.toLowerCase(),
            ),
        }))
      : profileSkills.map((item) => ({
          name:
            typeof item === "string"
              ? item
              : firstValue(item?.name, item?.skill, "Skill"),
          required: false,
          matched: true,
        }));

    const assessmentResult = cleanObject(assessment?.result);
    const assessmentScore =
      assessment?.status === "submitted"
        ? getAssessmentScore(assessmentResult)
        : null;

    const name = firstValue(
      studentUser.fullName,
      student.fullName,
      student.name,
      [student.firstName, student.lastName].filter(Boolean).join(" "),
      "Candidate",
    );

    const resumeText = application.resumeText || "";

    const profileResume = cleanObject(student.resume);

    const hasProfilePdf = Boolean(
      typeof profileResume.publicId === "string" &&
      profileResume.publicId.startsWith(
        `resumeai/users/${studentUser._id}/resumes/`,
      ) &&
      profileResume.resourceType === "raw",
    );

    const resumeName = firstValue(
      application.resumeName,
      profileResume.originalName,
      "Resume",
    );

    const resumeSource = application.resumeName
      ? application.resumeSource || "uploaded"
      : hasProfilePdf
        ? "profile"
        : application.resumeSource || "uploaded";

    return NextResponse.json(
      {
        success: true,
        candidate: {
          id: String(studentUser._id),
          name,
          initials: name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase(),
          role: firstValue(
            student.currentRole,
            student.jobTitle,
            student.designation,
            student.professionalTitle,
            "Candidate",
          ),
          experience: getExperience(student),
          location: firstValue(
            student.location,
            student.currentLocation,
            student.city,
            student.address,
            "Not specified",
          ),
          email: studentUser.email,
          phone: firstValue(
            student.phone,
            student.phoneNumber,
            student.mobile,
            student.contactNumber,
            "",
          ),
          appliedDate: dateLabel(application.submittedAt),
          status: application.status,
          aiMatch: Number(analysis.score) || 0,
          skillsMatch: Number(breakdown.skill) || 0,
          experienceMatch: Number(breakdown.experience) || 0,
          educationMatch: Number(breakdown.education) || 0,
          profileMatch: Number(breakdown.profile) || 0,
          matchedSkills: asArray(analysis.matchedSkills),
          missingSkills: asArray(analysis.missingSkills),
          strengths: asArray(analysis.strengths),
          improvements: asArray(analysis.improvements),
          summary: analysis.summary || "",
          recommendation: analysis.recommendation || "",
          confidence: analysis.confidence || "low",
          skills,
          experienceHistory: normalizeExperience(student),
          education: normalizeEducation(student),
          assessment: {
            status: assessment?.status || "not_started",
            score: assessmentScore,
            breakdown: normalizeAssessmentBreakdown(assessmentResult),
            submittedAt: dateLabel(assessment?.submittedAt),
            durationSeconds: assessment?.durationSeconds || 0,
            result:
              assessment?.status === "submitted" ? assessmentResult : null,
          },

          resume: {
            name: resumeName,
            source: resumeSource,

            // Existing application resume text fallback.
            text: resumeText,

            // Original PDF uploaded to the candidate's profile.
            pdfAvailable: hasProfilePdf,

            // Available if either a PDF or stored resume text exists.
            available: Boolean(hasProfilePdf || resumeText.trim()),

            // Useful metadata for displaying the uploaded resume.
            originalName: hasProfilePdf
              ? profileResume.originalName
              : application.resumeName || "",

            uploadedAt: hasProfilePdf ? profileResume.uploadedAt || null : null,
          },

          job: {
            id: String(jobId),
            title: job.title,
            industry: job.industry,
            location: job.location,
            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,
            educationRequirement: job.educationRequirement,
          },
          applicationId: String(application._id),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Recruiter candidate details GET error:", error);
    return errorResponse("Unable to load candidate details right now.", 500);
  }
}
