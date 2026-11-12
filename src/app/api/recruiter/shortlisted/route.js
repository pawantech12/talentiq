import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";

import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";

export const dynamic = "force-dynamic";

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number)));
};

// Assessment.result is Mixed in your schema, so support common result shapes.
// Adjust these keys if your assessment submission route stores a different shape.
function getAssessmentScore(result) {
  if (!result || typeof result !== "object") return null;

  const directScore =
    result.score ??
    result.percentage ??
    result.overallScore ??
    result.totalScore;

  if (directScore !== undefined && directScore !== null) {
    return clampScore(directScore);
  }

  const obtained = Number(
    result.obtainedMarks ?? result.marksObtained ?? result.correctAnswers,
  );

  const total = Number(
    result.totalMarks ?? result.maxMarks ?? result.totalQuestions,
  );

  if (Number.isFinite(obtained) && Number.isFinite(total) && total > 0) {
    return clampScore((obtained / total) * 100);
  }

  return null;
}

function getCandidateName(student) {
  return (
    student?.fullName ||
    student?.name ||
    student?.profile?.fullName ||
    student?.profile?.student?.fullName ||
    student?.profile?.student?.name ||
    "Candidate"
  );
}

function getCandidateExperience(student) {
  const profile = student?.profile?.student || student?.profile || {};

  const experience =
    profile.experience ??
    profile.totalExperience ??
    profile.workExperience ??
    profile.experienceYears;

  if (experience === undefined || experience === null || experience === "") {
    return "Not specified";
  }

  if (typeof experience === "number") {
    return `${experience} ${experience === 1 ? "Year" : "Years"}`;
  }

  return String(experience);
}

function getInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export async function GET(request) {
  try {
    await connectDB();

    const authResult = await getAuthenticatedUser(request);
    const user = authResult?.user || authResult;

    if (!user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "recruiter" || user.accountStatus === "disabled") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to access this page.",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    const jobId = searchParams.get("jobId") || "all";
    const status = searchParams.get("status") || "Shortlisted";
    const sortBy = searchParams.get("sortBy") || "Recently Shortlisted";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 5),
    );

    if (!["Shortlisted", "All"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid candidate status filter." },
        { status: 400 },
      );
    }

    if (
      ![
        "Recently Shortlisted",
        "Highest AI Match",
        "Highest Skills Match",
      ].includes(sortBy)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid sorting option." },
        { status: 400 },
      );
    }

    const ownedJobs = await Job.find({ recruiter: user._id })
      .select("_id title")
      .sort({ title: 1 })
      .lean();

    const ownedJobIds = ownedJobs.map((job) => job._id);

    if (jobId !== "all" && !mongoose.isValidObjectId(jobId)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID." },
        { status: 400 },
      );
    }

    if (
      jobId !== "all" &&
      !ownedJobIds.some((id) => String(id) === String(jobId))
    ) {
      return NextResponse.json(
        { success: false, message: "Job not found or access denied." },
        { status: 404 },
      );
    }

    const selectedJobIds =
      jobId === "all" ? ownedJobIds : [new mongoose.Types.ObjectId(jobId)];

    if (selectedJobIds.length === 0) {
      return NextResponse.json({
        success: true,
        candidates: [],
        jobs: [],
        stats: {
          shortlisted: 0,
          strongMatches: 0,
          assessmentCompleted: 0,
        },
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Stats are calculated from shortlisted applications, independently
    // of the current status filter and pagination.
    const shortlistedApplications = await Application.find({
      job: { $in: selectedJobIds },
      status: "Shortlisted",
    })
      .select("_id analysis.score")
      .lean();

    const shortlistedApplicationIds = shortlistedApplications.map(
      (application) => application._id,
    );

    const completedAssessmentCount =
      shortlistedApplicationIds.length > 0
        ? await Assessment.countDocuments({
            application: { $in: shortlistedApplicationIds },
            status: "submitted",
          })
        : 0;

    const strongMatches = shortlistedApplications.filter(
      (application) => Number(application.analysis?.score || 0) >= 85,
    ).length;

    const stats = {
      shortlisted: shortlistedApplications.length,
      strongMatches,
      assessmentCompleted: completedAssessmentCount,
    };

    const applicationFilter = {
      job: { $in: selectedJobIds },
    };

    if (status === "Shortlisted") {
      applicationFilter.status = "Shortlisted";
    }

    const sort = {
      "Highest AI Match": {
        "analysis.score": -1,
        updatedAt: -1,
      },
      "Highest Skills Match": {
        "analysis.breakdown.skill": -1,
        updatedAt: -1,
      },
      "Recently Shortlisted": {
        updatedAt: -1,
        submittedAt: -1,
      },
    }[sortBy];

    const [total, applications] = await Promise.all([
      Application.countDocuments(applicationFilter),

      Application.find(applicationFilter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "student",
          select: "fullName name email phone profile accountStatus",
        })
        .populate({
          path: "job",
          select: "title",
        })
        .select("student job status analysis submittedAt updatedAt createdAt")
        .lean(),
    ]);

    const applicationIds = applications.map((application) => application._id);

    const assessments =
      applicationIds.length > 0
        ? await Assessment.find({
            application: { $in: applicationIds },
          })
            .select("application status submittedAt result")
            .lean()
        : [];

    const assessmentByApplication = new Map(
      assessments.map((assessment) => [
        String(assessment.application),
        assessment,
      ]),
    );

    const candidates = applications
      .filter((application) => {
        const student = application.student;
        return student && student.accountStatus !== "disabled";
      })
      .map((application) => {
        const student = application.student;
        const name = getCandidateName(student);
        const assessment = assessmentByApplication.get(String(application._id));

        const isAssessmentCompleted = assessment?.status === "submitted";
        const assessmentScore = isAssessmentCompleted
          ? getAssessmentScore(assessment.result)
          : null;

        const shortlistedDate =
          application.updatedAt ||
          application.submittedAt ||
          application.createdAt;

        return {
          id: String(student._id),
          applicationId: String(application._id),
          name,
          initials: getInitials(name),
          job: application.job?.title || "Untitled job",
          jobId: String(application.job?._id || application.job),
          experience: getCandidateExperience(student),
          aiMatch: clampScore(application.analysis?.score) ?? 0,
          skills: clampScore(application.analysis?.breakdown?.skill) ?? 0,
          assessment: assessmentScore,
          assessmentStatus: isAssessmentCompleted ? "completed" : "pending",
          shortlistedDate: shortlistedDate
            ? new Date(shortlistedDate).toISOString()
            : null,
          status: application.status,
        };
      });

    return NextResponse.json(
      {
        success: true,
        candidates,
        jobs: ownedJobs.map((job) => ({
          id: String(job._id),
          title: job.title || "Untitled job",
        })),
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Recruiter shortlisted candidates API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load shortlisted candidates.",
      },
      { status: 500 },
    );
  }
}
