import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAuthenticatedUser } from "@/lib/profile-auth";

import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";
import { connectDB } from "@/lib/mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorResponse = (message, status = 400) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
};

// Get authenticated recruiter
async function requireRecruiter(request) {
  const authResult = await getAuthenticatedUser(request);

  const recruiter = authResult?.user || authResult;

  if (!recruiter?._id) {
    return {
      error: errorResponse("Authentication required.", 401),
    };
  }

  if (recruiter.role !== "recruiter") {
    return {
      error: errorResponse("Recruiter access only.", 403),
    };
  }

  if (recruiter.accountStatus === "disabled") {
    return {
      error: errorResponse("Your account is disabled.", 403),
    };
  }

  return { recruiter };
}

// Safely format text
function cleanText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim().slice(0, 500);
}

// Get student experience
function getExperience(student = {}) {
  const experienceLevel =
    student.experienceLevel || student.currentRole || student.role;

  if (typeof experienceLevel === "string" && experienceLevel.trim()) {
    return experienceLevel.trim().slice(0, 80);
  }

  const experiences = Array.isArray(student.experiences)
    ? student.experiences
    : [];

  if (!experiences.length) {
    return "Not specified";
  }

  let totalMonths = 0;

  for (const experience of experiences) {
    const startDate = experience?.startDate
      ? new Date(experience.startDate)
      : null;

    const endDate = experience?.endDate
      ? new Date(experience.endDate)
      : new Date();

    if (
      !startDate ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      continue;
    }

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth();

    totalMonths += Math.max(0, months);
  }

  if (!totalMonths) {
    return "Experience listed";
  }

  const years = Math.round((totalMonths / 12) * 10) / 10;

  return `${years} Years`;
}

// Extract assessment percentage
function getAssessmentScore(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const possibleScores = [
    result.score,
    result.percentage,
    result.totalPercentage,
    result.overallScore,
    result.percent,
  ];

  const score = possibleScores.find(
    (value) =>
      value !== null && value !== undefined && Number.isFinite(Number(value)),
  );

  if (score === undefined) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(Number(score))));
}

export async function GET(request, { params }) {
  try {
    // 1. Authenticate recruiter
    const { recruiter, error } = await requireRecruiter(request);

    if (error) {
      return error;
    }

    // 2. Validate job ID
    const { id: jobId } = await params;

    if (!mongoose.isValidObjectId(jobId)) {
      return errorResponse("Invalid job ID.", 400);
    }

    // 3. Connect database
    await connectDB();

    // 4. Verify job belongs to recruiter
    const job = await Job.findOne({
      _id: jobId,
      recruiter: recruiter._id,
    })
      .select(
        "title industry location employmentType experienceLevel applicationCount status",
      )
      .lean();

    if (!job) {
      return errorResponse(
        "Job not found or you do not have access to it.",
        404,
      );
    }

    // 5. Fetch applications
    const applications = await Application.find({
      job: jobId,
    })
      .select(
        "student resumeName resumeSource analysis status submittedAt analyzedAt createdAt updatedAt",
      )
      .populate({
        path: "student",
        select: "name firstName lastName email profile role accountStatus",
        match: {
          role: "student",
          accountStatus: { $ne: "disabled" },
        },
      })
      .sort({
        submittedAt: -1,
        createdAt: -1,
      })
      .lean();

    // Exclude applications whose student account is unavailable
    const validApplications = applications.filter(
      (application) => application.student,
    );

    // 6. Get student IDs
    const studentIds = validApplications.map(
      (application) => application.student._id,
    );

    // 7. Fetch assessment records for this job
    const assessments = studentIds.length
      ? await Assessment.find({
          job: jobId,
          student: { $in: studentIds },
        })
          .select("student status result submittedAt")
          .lean()
      : [];

    const assessmentMap = new Map(
      assessments.map((assessment) => [String(assessment.student), assessment]),
    );

    // 8. Format applicant data
    const applicants = validApplications.map((application) => {
      const student = application.student;

      const profile = student.profile || {};

      const studentProfile = profile.student || profile;

      const fullName =
        [student.firstName, student.lastName].filter(Boolean).join(" ") ||
        student.name ||
        studentProfile.fullName ||
        studentProfile.name ||
        "Student";

      const analysisScore = Number(application.analysis?.score);

      const aiMatch = Number.isFinite(analysisScore)
        ? Math.max(0, Math.min(100, Math.round(analysisScore)))
        : 0;

      const assessment = assessmentMap.get(String(student._id));

      const assessmentScore =
        assessment?.status === "submitted"
          ? getAssessmentScore(assessment.result)
          : null;

      return {
        id: String(application._id),

        studentId: String(student._id),

        name: cleanText(fullName, "Student"),

        email: cleanText(student.email),

        experience: getExperience(studentProfile),

        location: cleanText(
          studentProfile.preferredLocation || studentProfile.location,
          "Not specified",
        ),

        aiMatch,

        assessment: assessmentScore,

        assessmentStatus: assessment?.status || "not_started",

        status: application.status,

        appliedAt: application.submittedAt || application.createdAt,

        resumeName: cleanText(application.resumeName),

        resumeSource: application.resumeSource,

        analysis: {
          summary: cleanText(application.analysis?.summary),

          recommendation: cleanText(application.analysis?.recommendation),

          confidence: application.analysis?.confidence || "low",
        },
      };
    });

    // 9. Calculate statistics
    const stats = {
      total: applicants.length,

      submitted: applicants.filter((item) => item.status === "Submitted")
        .length,

      underReview: applicants.filter((item) => item.status === "Under Review")
        .length,

      shortlisted: applicants.filter((item) => item.status === "Shortlisted")
        .length,

      analyzed: applicants.filter((item) => Boolean(item.resumeName)).length,

      strongMatches: applicants.filter((item) => item.aiMatch >= 84).length,
    };

    // 10. Return response
    return NextResponse.json(
      {
        success: true,
        job,
        applicants,
        stats,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Recruiter applicants GET error:", error);

    return errorResponse("Unable to load applicants right now.", 500);
  }
}
