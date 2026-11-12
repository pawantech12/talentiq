import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";

import Job from "@/app/models/Job";
import Application from "@/app/models/Application";

export const dynamic = "force-dynamic";

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

    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 9),
    );

    const filter = {
      recruiter: new mongoose.Types.ObjectId(user._id),
    };

    if (status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const [jobs, totalJobs, allRecruiterJobs] = await Promise.all([
      Job.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "title industry location employmentType experienceLevel status requiredSkills preferredSkills createdAt updatedAt applicationCount",
        )
        .lean(),

      Job.countDocuments(filter),

      Job.find({ recruiter: user._id }).select("_id").lean(),
    ]);

    const jobIds = jobs.map((job) => job._id);
    const allJobIds = allRecruiterJobs.map((job) => job._id);

    const [pageStats, overallStats] = await Promise.all([
      jobIds.length
        ? Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            {
              $group: {
                _id: "$job",
                applicants: { $sum: 1 },
                analyzed: {
                  $sum: {
                    $cond: [
                      { $ne: [{ $ifNull: ["$analysis.score", null] }, null] },
                      1,
                      0,
                    ],
                  },
                },
                strongMatches: {
                  $sum: {
                    $cond: [
                      { $gte: [{ $ifNull: ["$analysis.score", 0] }, 85] },
                      1,
                      0,
                    ],
                  },
                },
                scoreTotal: {
                  $sum: {
                    $cond: [
                      { $ne: [{ $ifNull: ["$analysis.score", null] }, null] },
                      "$analysis.score",
                      0,
                    ],
                  },
                },
                shortlisted: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Shortlisted"] }, 1, 0],
                  },
                },
              },
            },
          ])
        : [],

      allJobIds.length
        ? Application.aggregate([
            { $match: { job: { $in: allJobIds } } },
            {
              $group: {
                _id: null,
                applicants: { $sum: 1 },
                analyzed: {
                  $sum: {
                    $cond: [
                      { $ne: [{ $ifNull: ["$analysis.score", null] }, null] },
                      1,
                      0,
                    ],
                  },
                },
                strongMatches: {
                  $sum: {
                    $cond: [
                      { $gte: [{ $ifNull: ["$analysis.score", 0] }, 85] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ])
        : [],
    ]);

    const statsByJob = new Map(
      pageStats.map((item) => [String(item._id), item]),
    );

    const formattedJobs = jobs.map((job) => {
      const stats = statsByJob.get(String(job._id)) || {
        applicants: 0,
        analyzed: 0,
        strongMatches: 0,
        scoreTotal: 0,
        shortlisted: 0,
      };

      return {
        id: String(job._id),
        title: job.title || "Untitled position",
        industry: job.industry || "Not specified",
        location: job.location || "Not specified",
        employmentType: job.employmentType || "Not specified",
        experienceLevel: job.experienceLevel || "Not specified",
        status: job.status || "Draft",
        requiredSkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        applicants: stats.applicants,
        analyzed: stats.analyzed,
        strongMatches: stats.strongMatches,
        shortlisted: stats.shortlisted,
        averageScore:
          stats.analyzed > 0
            ? Math.round(stats.scoreTotal / stats.analyzed)
            : 0,
        analysisProgress:
          stats.applicants > 0
            ? Math.round((stats.analyzed / stats.applicants) * 100)
            : 0,
      };
    });

    const totals = overallStats[0] || {
      applicants: 0,
      analyzed: 0,
      strongMatches: 0,
    };

    return NextResponse.json(
      {
        success: true,
        jobs: formattedJobs,
        stats: {
          totalJobs: allRecruiterJobs.length,
          totalApplicants: totals.applicants,
          analyzed: totals.analyzed,
          strongMatches: totals.strongMatches,
        },
        pagination: {
          page,
          limit,
          total: totalJobs,
          totalPages: Math.ceil(totalJobs / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Recruiter AI screening dashboard error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load AI screening dashboard." },
      { status: 500 },
    );
  }
}
