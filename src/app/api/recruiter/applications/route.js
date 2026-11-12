import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import Application from "@/app/models/Application";
import Job from "@/app/models/Job";
import User from "@/app/models/User";
import Assessment from "@/app/models/Assessment";

const ALLOWED_STATUSES = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Rejected",
];

const getAuthUser = async (request) => {
  const result = await getAuthenticatedUser(request);
  return result?.user || result;
};

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export async function GET(request) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "recruiter") {
      return NextResponse.json(
        { success: false, message: "Recruiter access required" },
        { status: 403 },
      );
    }

    if (user.accountStatus === "disabled") {
      return NextResponse.json(
        { success: false, message: "Your account is disabled" },
        { status: 403 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "all";
    const jobId = searchParams.get("jobId") || "all";

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
    );

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "10", 10) || 10),
    );

    if (status !== "all" && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid application status" },
        { status: 400 },
      );
    }

    if (jobId !== "all" && !isValidObjectId(jobId)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID" },
        { status: 400 },
      );
    }

    // Only jobs created by this recruiter are considered.
    const recruiterJobs = await Job.find({
      recruiter: user._id,
    })
      .select("_id title location employmentType status")
      .sort({ createdAt: -1 })
      .lean();

    const recruiterJobIds = recruiterJobs.map((job) => job._id);
    const jobs = recruiterJobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      location: job.location,
      employmentType: job.employmentType,
      status: job.status,
    }));

    if (jobId !== "all") {
      const ownsJob = recruiterJobIds.some((id) => id.toString() === jobId);

      if (!ownsJob) {
        return NextResponse.json(
          { success: false, message: "Job not found" },
          { status: 404 },
        );
      }
    }

    if (!recruiterJobIds.length) {
      return NextResponse.json({
        success: true,
        applications: [],
        jobs,
        stats: {
          total: 0,
          submitted: 0,
          underReview: 0,
          shortlisted: 0,
          rejected: 0,
        },
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const baseQuery = {
      job: { $in: recruiterJobIds },
    };

    // Statistics are calculated across all of the recruiter's jobs,
    // independent of the active filters.
    const statsAggregation = await Application.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      submitted: 0,
      underReview: 0,
      shortlisted: 0,
      rejected: 0,
    };

    statsAggregation.forEach(({ _id, count }) => {
      stats.total += count;

      if (_id === "Submitted") stats.submitted = count;
      if (_id === "Under Review") stats.underReview = count;
      if (_id === "Shortlisted") stats.shortlisted = count;
      if (_id === "Rejected") stats.rejected = count;
    });

    const query = { ...baseQuery };

    if (jobId !== "all") {
      query.job = new mongoose.Types.ObjectId(jobId);
    }

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      const [matchingStudents, matchingJobs] = await Promise.all([
        User.find({
          role: "student",
          $or: [{ fullName: regex }, { email: regex }],
        })
          .select("_id")
          .lean(),

        Job.find({
          recruiter: user._id,
          title: regex,
        })
          .select("_id")
          .lean(),
      ]);

      const studentIds = matchingStudents.map((student) => student._id);
      const matchingJobIds = matchingJobs.map((job) => job._id);

      query.$or = [
        { student: { $in: studentIds } },
        { job: { $in: matchingJobIds } },
        { resumeName: regex },
      ];
    }

    const total = await Application.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const safePage = totalPages ? Math.min(page, totalPages) : 1;

    const applicationDocs = await Application.find(query)
      .select(
        "student job resumeName resumeSource analysis.score analysis.matchedSkills status submittedAt analyzedAt createdAt updatedAt",
      )
      .populate({
        path: "student",
        select: "fullName email profile accountStatus",
        match: { role: "student" },
      })
      .populate({
        path: "job",
        select: "title location employmentType status recruiter",
      })
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit)
      .lean();

    // Remove any records whose references are missing or do not match.
    const validApplications = applicationDocs.filter(
      (application) =>
        application.student &&
        application.job &&
        application.job.recruiter?.toString() === user._id.toString(),
    );

    const applicationIds = validApplications.map(
      (application) => application._id,
    );

    const assessments = applicationIds.length
      ? await Assessment.find({
          application: { $in: applicationIds },
          student: { $in: validApplications.map((a) => a.student._id) },
          job: { $in: validApplications.map((a) => a.job._id) },
        })
          .select("application status submittedAt result")
          .lean()
      : [];

    const assessmentMap = new Map(
      assessments.map((assessment) => [
        assessment.application.toString(),
        assessment,
      ]),
    );

    const applications = validApplications.map((application) => {
      const student = application.student;
      const job = application.job;
      const assessment = assessmentMap.get(application._id.toString());

      const studentProfile = student.profile?.student || {};
      const fullName = student.fullName || "Student";

      return {
        id: application._id.toString(),
        applicationId: application._id.toString(),

        student: {
          id: student._id.toString(),
          name: fullName,
          initials: fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase(),
          email: student.email || "",
          phone: studentProfile.phone || "",
          location: studentProfile.location || "",
          currentRole: studentProfile.currentRole || "",
          experienceLevel: studentProfile.experienceLevel || "",
          skills: Array.isArray(studentProfile.skills)
            ? studentProfile.skills.slice(0, 12)
            : [],
          accountStatus: student.accountStatus || "active",
        },

        job: {
          id: job._id.toString(),
          title: job.title,
          location: job.location,
          employmentType: job.employmentType,
          status: job.status,
        },

        resume: {
          name: application.resumeName,
          source: application.resumeSource,
        },

        aiMatch: Number(application.analysis?.score || 0),
        matchedSkills: application.analysis?.matchedSkills || [],
        status: application.status,
        submittedAt: application.submittedAt,
        appliedDate: application.submittedAt || application.createdAt,

        assessment: assessment
          ? {
              status: assessment.status,
              submittedAt: assessment.submittedAt,
              result: assessment.result || null,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      applications,
      jobs,
      stats,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Recruiter applications GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch applications",
      },
      { status: 500 },
    );
  }
}
