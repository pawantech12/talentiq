import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";
import { getAuthenticatedUser } from "@/lib/profile-auth";

export const dynamic = "force-dynamic";

function getAssessmentScore(result) {
  if (!result || typeof result !== "object") return null;

  const possibleScores = [
    result.score,
    result.percentage,
    result.overallScore,
    result.totalScore,
  ];

  const score = possibleScores.find(
    (value) => typeof value === "number" && Number.isFinite(value),
  );

  if (score === undefined) return null;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getDashboardStatus(applicationStatus, assessment) {
  if (applicationStatus === "Rejected") return "Rejected";
  if (applicationStatus === "Shortlisted") return "Shortlisted";

  if (assessment?.status === "submitted") return "Completed";
  if (
    assessment?.status === "in_progress" ||
    assessment?.status === "expired"
  ) {
    return "Assessment Pending";
  }

  if (applicationStatus === "Under Review") return "In Review";

  return "In Review";
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in to continue." },
        { status: 401 },
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student access only." },
        { status: 403 },
      );
    }

    if (user.accountStatus === "disabled") {
      return NextResponse.json(
        { success: false, message: "Your account is disabled." },
        { status: 403 },
      );
    }

    await connectDB();

    const records = await Application.find({ student: user._id })
      .select("job resumeName analysis status submittedAt createdAt")
      .populate({
        path: "job",
        select: "title location recruiter requireSkillAssessment status",
        populate: {
          path: "recruiter",
          select: "fullName profile",
        },
      })
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    const applicationIds = records.map((item) => item._id);

    const assessments = applicationIds.length
      ? await Assessment.find({
          student: user._id,
          application: { $in: applicationIds },
        })
          .select("application status result submittedAt")
          .lean()
      : [];

    const assessmentByApplication = new Map(
      assessments.map((item) => [String(item.application), item]),
    );

    const applications = records.map((item) => {
      const job = item.job;
      const assessment = assessmentByApplication.get(String(item._id));

      const resumeMatch =
        typeof item.analysis?.score === "number"
          ? Math.max(0, Math.min(100, Math.round(item.analysis.score)))
          : null;

      const assessmentScore =
        assessment?.status === "submitted"
          ? getAssessmentScore(assessment.result)
          : null;

      const overallMatch =
        resumeMatch !== null && assessmentScore !== null
          ? Math.round((resumeMatch + assessmentScore) / 2)
          : null;

      const dashboardStatus = getDashboardStatus(item.status, assessment);

      let action = "View Application";

      if (
        assessment?.status === "in_progress" ||
        assessment?.status === "expired"
      ) {
        action = "Continue Assessment";
      } else if (assessment?.status === "submitted") {
        action = "View Result";
      } else if (job?.requireSkillAssessment && item.status !== "Rejected") {
        action = "Continue Assessment";
      }

      const appliedAt = item.submittedAt || item.createdAt;

      return {
        id: String(item._id),
        jobId: job ? String(job._id) : null,
        title: job?.title || "Job no longer available",
        company: job?.recruiter.profile?.recruiter?.companyName || "Company",
        location: job?.location || "Not specified",
        appliedDate: appliedAt
          ? new Date(appliedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "",
        dateValue: appliedAt ? new Date(appliedAt).getTime() : 0,
        status: dashboardStatus,
        applicationStatus: item.status,
        resumeMatch,
        assessment:
          assessmentScore !== null
            ? assessmentScore
            : assessment?.status === "submitted"
              ? null
              : assessment?.status === "in_progress" ||
                  assessment?.status === "expired"
                ? "Not Started"
                : job?.requireSkillAssessment
                  ? "Not Started"
                  : null,
        assessmentStatus: assessment?.status || "not_started",
        overallMatch,
        action,
        initials: (job?.title || "JB")
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toUpperCase(),
      };
    });

    return NextResponse.json({
      success: true,
      applications,
      stats: {
        total: applications.length,
        inReview: applications.filter((item) => item.status === "In Review")
          .length,
        shortlisted: applications.filter(
          (item) => item.status === "Shortlisted",
        ).length,
        completed: applications.filter((item) => item.status === "Completed")
          .length,
      },
    });
  } catch (error) {
    console.error("Student applications API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load your applications." },
      { status: 500 },
    );
  }
}
