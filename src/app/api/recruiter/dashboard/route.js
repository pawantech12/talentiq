import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";

import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getAuthUser = async (request) => {
  const result = await getAuthenticatedUser(request);
  return result?.user || result;
};

const clampScore = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return Math.max(0, Math.min(100, Math.round(number)));
};

const getAssessmentScore = (result) => {
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
};

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const getStudentName = (student) =>
  student?.fullName ||
  student?.name ||
  student?.profile?.fullName ||
  student?.profile?.student?.fullName ||
  "Candidate";

const getAssessmentLabel = (assessment) => {
  if (!assessment || assessment.status !== "submitted") {
    return "Pending";
  }

  const score = getAssessmentScore(assessment.result);

  return score === null ? "Completed" : `${score}%`;
};

export async function GET(request) {
  try {
    const user = await getAuthUser(request);

    if (!user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "recruiter") {
      return NextResponse.json(
        { success: false, message: "Recruiter access required." },
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

    // Only this recruiter's jobs are included.
    const jobs = await Job.find({
      recruiter: user._id,
      status: "Active",
    })
      .select("_id title status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const allRecruiterJobs = await Job.find({
      recruiter: user._id,
    })
      .select("_id")
      .lean();

    const allJobIds = allRecruiterJobs.map((job) => job._id);
    const activeJobIds = jobs.map((job) => job._id);

    if (!allJobIds.length) {
      return NextResponse.json(
        {
          success: true,
          recruiter: {
            name: user.fullName || user.name || "Recruiter",
          },
          stats: {
            activeJobs: 0,
            totalApplications: 0,
            toReview: 0,
            shortlisted: 0,
          },
          screeningStats: {
            analyzed: 0,
            strong: 0,
            medium: 0,
            low: 0,
          },
          applications: [],
          jobs: [],
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    // Aggregate all application statistics for this recruiter.
    const applicationStatsResult = await Application.aggregate([
      {
        $match: {
          job: { $in: allJobIds },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },

          submitted: {
            $sum: {
              $cond: [{ $eq: ["$status", "Submitted"] }, 1, 0],
            },
          },

          underReview: {
            $sum: {
              $cond: [{ $eq: ["$status", "Under Review"] }, 1, 0],
            },
          },

          shortlisted: {
            $sum: {
              $cond: [{ $eq: ["$status", "Shortlisted"] }, 1, 0],
            },
          },

          analyzed: {
            $sum: {
              $cond: [
                {
                  $ne: [{ $ifNull: ["$analysis.score", null] }, null],
                },
                1,
                0,
              ],
            },
          },

          strong: {
            $sum: {
              $cond: [
                { $gte: [{ $ifNull: ["$analysis.score", 0] }, 85] },
                1,
                0,
              ],
            },
          },

          medium: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: [{ $ifNull: ["$analysis.score", 0] }, 70] },
                    { $lt: [{ $ifNull: ["$analysis.score", 0] }, 85] },
                  ],
                },
                1,
                0,
              ],
            },
          },

          low: {
            $sum: {
              $cond: [{ $lt: [{ $ifNull: ["$analysis.score", 0] }, 70] }, 1, 0],
            },
          },
        },
      },
    ]);

    const aggregateStats = applicationStatsResult[0] || {};

    // Get the latest applications across all jobs owned by this recruiter.
    const recentApplicationDocs = await Application.find({
      job: { $in: allJobIds },
    })
      .select(
        "student job analysis.score status submittedAt createdAt updatedAt resumeName",
      )
      .populate({
        path: "student",
        select: "fullName name email profile accountStatus",
        match: { role: "student" },
      })
      .populate({
        path: "job",
        select: "title recruiter status",
      })
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(30)
      .lean();

    const validApplications = recentApplicationDocs.filter(
      (application) =>
        application.student &&
        application.student.accountStatus !== "disabled" &&
        application.job &&
        String(application.job.recruiter) === String(user._id),
    );

    const applicationIds = validApplications.map(
      (application) => application._id,
    );

    const assessments = applicationIds.length
      ? await Assessment.find({
          application: { $in: applicationIds },
        })
          .select("application status submittedAt result")
          .lean()
      : [];

    const assessmentMap = new Map(
      assessments.map((assessment) => [
        String(assessment.application),
        assessment,
      ]),
    );

    const applications = validApplications.slice(0, 12).map((application) => {
      const student = application.student;
      const job = application.job;
      const name = getStudentName(student);
      const assessment = assessmentMap.get(String(application._id));

      const appliedDate =
        application.submittedAt ||
        application.createdAt ||
        application.updatedAt;

      return {
        id: String(application._id),
        applicationId: String(application._id),
        studentId: String(student._id),
        jobId: String(job._id),

        name,
        initials: getInitials(name),

        role: job.title || "Untitled position",
        appliedFor: job.title || "Untitled position",

        match: clampScore(application.analysis?.score) ?? 0,

        assessment: getAssessmentLabel(assessment),

        status: application.status || "Submitted",

        appliedAt: appliedDate || null,

        email: student.email || "",
      };
    });

    // Aggregate application counts and average AI match for active jobs.
    const activeJobStats = activeJobIds.length
      ? await Application.aggregate([
          {
            $match: {
              job: { $in: activeJobIds },
            },
          },
          {
            $group: {
              _id: "$job",
              applications: { $sum: 1 },
              scoreTotal: {
                $sum: {
                  $ifNull: ["$analysis.score", 0],
                },
              },
              analyzedCount: {
                $sum: {
                  $cond: [
                    {
                      $ne: [{ $ifNull: ["$analysis.score", null] }, null],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
      : [];

    const jobStatsMap = new Map(
      activeJobStats.map((item) => [String(item._id), item]),
    );

    const formattedJobs = jobs.map((job) => {
      const stats = jobStatsMap.get(String(job._id)) || {
        applications: 0,
        scoreTotal: 0,
        analyzedCount: 0,
      };

      const averageMatch =
        stats.analyzedCount > 0
          ? Math.round(stats.scoreTotal / stats.analyzedCount)
          : null;

      return {
        id: String(job._id),
        title: job.title,
        applications: stats.applications,
        match:
          averageMatch === null
            ? "AI Screening Active"
            : `${averageMatch}% Avg Match`,
        averageMatch,
        status: job.status,
      };
    });

    const recruiterName =
      user.fullName || user.name || user.profile?.fullName || "Recruiter";

    return NextResponse.json(
      {
        success: true,

        recruiter: {
          name: recruiterName,
        },

        stats: {
          activeJobs: jobs.length,
          totalApplications: aggregateStats.total || 0,
          toReview:
            (aggregateStats.submitted || 0) + (aggregateStats.underReview || 0),
          shortlisted: aggregateStats.shortlisted || 0,
        },

        screeningStats: {
          analyzed: aggregateStats.analyzed || 0,
          strong: aggregateStats.strong || 0,
          medium: aggregateStats.medium || 0,
          low: aggregateStats.low || 0,
        },

        applications,
        jobs: formattedJobs,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Recruiter dashboard GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your recruiter dashboard.",
      },
      { status: 500 },
    );
  }
}
