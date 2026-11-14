import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";

import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEIGHTS = {
  resume: 40,
  skills: 25,
  experience: 20,
  assessment: 10,
  education: 5,
};

const response = (body, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

const getAuthUser = async (request) => {
  const result = await getAuthenticatedUser(request);
  return result?.user || result;
};

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number));
};

const getAssessmentScore = (assessment) => {
  if (!assessment || assessment.status !== "submitted") return null;

  const result = assessment.result || {};

  const possibleScores = [
    result.score,
    result.percentage,
    result.overallScore,
    result.totalScore,
    result.obtainedPercentage,
  ];

  for (const value of possibleScores) {
    if (value !== undefined && value !== null && value !== "") {
      return clampScore(value);
    }
  }

  const obtained = Number(
    result.obtainedMarks ?? result.correctAnswers ?? result.marksObtained,
  );

  const total = Number(
    result.totalMarks ?? result.totalQuestions ?? result.maxMarks,
  );

  if (Number.isFinite(obtained) && Number.isFinite(total) && total > 0) {
    return clampScore((obtained / total) * 100);
  }

  return null;
};

const getOverallScore = ({
  resume,
  skills,
  experience,
  assessment,
  education,
}) => {
  let weightedScore =
    resume * WEIGHTS.resume +
    skills * WEIGHTS.skills +
    experience * WEIGHTS.experience +
    education * WEIGHTS.education;

  let totalWeight =
    WEIGHTS.resume + WEIGHTS.skills + WEIGHTS.experience + WEIGHTS.education;

  // Do not penalize candidates who have not submitted an assessment.
  if (assessment !== null) {
    weightedScore += assessment * WEIGHTS.assessment;
    totalWeight += WEIGHTS.assessment;
  }

  return totalWeight ? Math.round(weightedScore / totalWeight) : 0;
};

const getMatchStatus = (score) => {
  if (score >= 85) return "Strong Match";
  if (score >= 75) return "Good Match";
  if (score >= 60) return "Potential Match";
  return "Moderate Match";
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getExperienceLabel = (profile = {}) =>
  profile.experienceLevel ||
  profile.totalExperience ||
  profile.experience ||
  "Not specified";

const getDateLabel = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAssessmentStatus = (assessment) => {
  if (!assessment) return "Not Started";
  if (assessment.status === "submitted") return "Completed";
  if (assessment.status === "expired") return "Expired";
  return "Pending";
};

const buildCandidate = (application, assessment) => {
  const student = application.student;
  const profile = student?.profile?.student || {};
  const analysis = application.analysis || {};
  const breakdown = analysis.breakdown || {};

  const resumeScore = clampScore(analysis.score);
  const skillsScore = clampScore(breakdown.skill);
  const experienceScore = clampScore(breakdown.experience);
  const educationScore = clampScore(breakdown.education);
  const assessmentScore = getAssessmentScore(assessment);

  const overall = getOverallScore({
    resume: resumeScore,
    skills: skillsScore,
    experience: experienceScore,
    assessment: assessmentScore,
    education: educationScore,
  });

  const name = student?.fullName || "Candidate";
  const assessmentStatus = getAssessmentStatus(assessment);

  return {
    id: String(student._id),
    studentId: String(student._id),
    applicationId: String(application._id),

    name,
    initials: getInitials(name),
    role: profile.currentRole || profile.jobTitle || "Candidate",
    experience: getExperienceLabel(profile),

    overall,
    aiMatch: resumeScore,
    skills: skillsScore,
    experienceMatch: experienceScore,
    assessment: assessmentScore,

    assessmentStatus,
    status: getMatchStatus(overall),

    applicationStatus: application.status,
    recommended: false,
    shortlisted: application.status === "Shortlisted",

    email: student.email || "",
    phone: profile.phone || "",
    location: profile.location || "",
    skillsList: Array.isArray(profile.skills)
      ? profile.skills.slice(0, 12)
      : [],

    matchedSkills: analysis.matchedSkills || [],
    missingSkills: analysis.missingSkills || [],

    appliedAt: application.submittedAt || application.createdAt,
    appliedDate: getDateLabel(application.submittedAt || application.createdAt),
  };
};

const sortCandidates = (candidates, sortBy) => {
  const items = [...candidates];

  const sorters = {
    "overall-desc": (a, b) => b.overall - a.overall,
    "overall-asc": (a, b) => a.overall - b.overall,
    "ai-desc": (a, b) => b.aiMatch - a.aiMatch,
    "skills-desc": (a, b) => b.skills - a.skills,
  };

  return items.sort(sorters[sortBy] || sorters["overall-desc"]);
};

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser(request);

    if (!user?._id) {
      return response(
        { success: false, message: "Authentication required." },
        401,
      );
    }

    if (user.role !== "recruiter") {
      return response(
        { success: false, message: "Recruiter access required." },
        403,
      );
    }

    if (user.accountStatus === "disabled") {
      return response(
        { success: false, message: "Your account is disabled." },
        403,
      );
    }

    const { jobId } = await params;

    if (!mongoose.isValidObjectId(jobId)) {
      return response({ success: false, message: "Invalid job ID." }, 400);
    }

    await connectDB();

    const job = await Job.findOne({
      _id: jobId,
      recruiter: user._id,
    })
      .select(
        "title industry location employmentType experienceLevel requiredSkills preferredSkills educationRequirement status applicationCount",
      )
      .lean();

    if (!job) {
      return response({ success: false, message: "Job not found." }, 404);
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
    );

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "6", 10) || 6),
    );

    const sortBy = searchParams.get("sortBy") || "overall-desc";
    const search = (searchParams.get("search") || "").trim();

    const applications = await Application.find({ job: job._id })
      .select(
        "student job resumeName resumeSource analysis status submittedAt createdAt",
      )
      .populate({
        path: "student",
        select: "fullName email profile role accountStatus",
        match: {
          role: "student",
          accountStatus: { $ne: "disabled" },
        },
      })
      .lean();

    const validApplications = applications.filter(
      (application) => application.student,
    );

    const applicationIds = validApplications.map(
      (application) => application._id,
    );

    const assessments = applicationIds.length
      ? await Assessment.find({
          application: { $in: applicationIds },
          job: job._id,
          status: { $in: ["submitted", "expired", "in_progress"] },
        })
          .select("application student job status submittedAt result")
          .lean()
      : [];

    const assessmentMap = new Map(
      assessments.map((item) => [String(item.application), item]),
    );

    let candidates = validApplications.map((application) =>
      buildCandidate(application, assessmentMap.get(String(application._id))),
    );

    if (search) {
      const searchValue = search.toLowerCase();

      candidates = candidates.filter((candidate) => {
        const searchable = [
          candidate.name,
          candidate.role,
          candidate.email,
          candidate.location,
          candidate.experience,
          ...candidate.skillsList,
          ...candidate.matchedSkills,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(searchValue);
      });
    }

    candidates = sortCandidates(candidates, sortBy);

    // The first candidate is the highest-ranked candidate for this result set.
    candidates = candidates.map((candidate, index) => ({
      ...candidate,
      rank: (page - 1) * limit + index + 1,
      recommended:
        sortBy === "overall-desc" &&
        page === 1 &&
        index === 0 &&
        candidate.overall >= 75,
    }));

    const total = candidates.length;
    const totalPages = Math.ceil(total / limit);
    const safePage = totalPages ? Math.min(page, totalPages) : 1;

    const startIndex = (safePage - 1) * limit;
    const paginatedCandidates = candidates.slice(
      startIndex,
      startIndex + limit,
    );

    const allCandidates = validApplications.map((application) =>
      buildCandidate(application, assessmentMap.get(String(application._id))),
    );

    const stats = {
      total: allCandidates.length,
      strongMatches: allCandidates.filter(
        (candidate) => candidate.overall >= 85,
      ).length,
      topCandidates: allCandidates.filter(
        (candidate) => candidate.overall >= 75,
      ).length,
      shortlisted: allCandidates.filter((candidate) => candidate.shortlisted)
        .length,
      assessmentCompleted: allCandidates.filter(
        (candidate) => candidate.assessment !== null,
      ).length,
    };

    return response({
      success: true,
      job: {
        id: String(job._id),
        title: job.title,
        industry: job.industry || "",
        location: job.location || "",
        employmentType: job.employmentType || "",
        experienceLevel: job.experienceLevel || "",
        requiredSkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        educationRequirement: job.educationRequirement || "",
        status: job.status,
      },
      candidates: paginatedCandidates,
      stats,
      weights: WEIGHTS,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("AI ranking GET error:", error);

    return response(
      {
        success: false,
        message: "Unable to load candidate rankings.",
      },
      500,
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser(request);

    if (!user?._id) {
      return response(
        { success: false, message: "Authentication required." },
        401,
      );
    }

    if (user.role !== "recruiter") {
      return response(
        { success: false, message: "Recruiter access required." },
        403,
      );
    }

    if (user.accountStatus === "disabled") {
      return response(
        { success: false, message: "Your account is disabled." },
        403,
      );
    }

    const { jobId } = await params;

    if (!mongoose.isValidObjectId(jobId)) {
      return response({ success: false, message: "Invalid job ID." }, 400);
    }

    const body = await request.json();
    const { applicationId, action } = body || {};

    if (!mongoose.isValidObjectId(applicationId)) {
      return response(
        { success: false, message: "Invalid application ID." },
        400,
      );
    }

    if (!["shortlist", "remove"].includes(action)) {
      return response(
        { success: false, message: "Invalid shortlist action." },
        400,
      );
    }

    await connectDB();

    const job = await Job.findOne({
      _id: jobId,
      recruiter: user._id,
    }).select("_id");

    if (!job) {
      return response({ success: false, message: "Job not found." }, 404);
    }

    const application = await Application.findOne({
      _id: applicationId,
      job: job._id,
    }).select("_id status");

    if (!application) {
      return response(
        { success: false, message: "Application not found for this job." },
        404,
      );
    }

    const nextStatus = action === "shortlist" ? "Shortlisted" : "Submitted";

    application.status = nextStatus;
    await application.save();

    return response({
      success: true,
      message:
        action === "shortlist"
          ? "Candidate shortlisted successfully."
          : "Candidate removed from shortlist.",
      applicationId: String(application._id),
      status: application.status,
    });
  } catch (error) {
    console.error("AI ranking PATCH error:", error);

    return response(
      {
        success: false,
        message: "Unable to update candidate shortlist.",
      },
      500,
    );
  }
}
