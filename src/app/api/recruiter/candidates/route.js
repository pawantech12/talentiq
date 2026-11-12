import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";

import User from "@/app/models/User";
import Job from "@/app/models/Job";
import Application from "@/app/models/Application";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorResponse = (message, status = 400) =>
  NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );

const cleanObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request) {
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

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const status = (searchParams.get("status") || "all").trim();
    const selectedJobId = (searchParams.get("jobId") || "").trim();

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 10),
    );

    if (selectedJobId && !mongoose.isValidObjectId(selectedJobId)) {
      return errorResponse("Invalid job ID.", 400);
    }

    // Only retrieve jobs owned by this recruiter.
    const jobQuery = { recruiter: recruiter._id };

    if (selectedJobId) {
      jobQuery._id = selectedJobId;
    }

    const jobs = await Job.find(jobQuery)
      .select("_id title location employmentType")
      .sort({ createdAt: -1 })
      .lean();

    const jobMap = new Map(jobs.map((job) => [String(job._id), job]));

    const jobIds = jobs.map((job) => job._id);

    if (!jobIds.length) {
      return NextResponse.json(
        {
          success: true,
          candidates: [],
          jobs: [],
          stats: {
            total: 0,
            pending: 0,
            shortlisted: 0,
            rejected: 0,
          },
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const applications = await Application.find({
      job: { $in: jobIds },
    })
      .select(
        "student job status submittedAt createdAt analysis resumeName resumeSource",
      )
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    const studentIds = [
      ...new Set(
        applications
          .map((application) => String(application.student))
          .filter(Boolean),
      ),
    ];

    const students = await User.find({
      _id: { $in: studentIds },
      role: "student",
      accountStatus: { $ne: "disabled" },
    })
      .select("fullName email profile createdAt")
      .lean();

    const studentMap = new Map(
      students.map((student) => [String(student._id), student]),
    );

    const allCandidates = applications
      .map((application) => {
        const studentUser = studentMap.get(String(application.student));
        const job = jobMap.get(String(application.job));

        if (!studentUser || !job) return null;

        const profile = cleanObject(studentUser.profile);
        const student = cleanObject(profile.student || profile);
        const resume = cleanObject(student.resume);
        const analysis = cleanObject(application.analysis);

        const name = firstValue(
          studentUser.fullName,
          student.fullName,
          student.name,
          [student.firstName, student.lastName].filter(Boolean).join(" "),
          "Candidate",
        );

        const hasProfilePdf = Boolean(
          typeof resume.publicId === "string" &&
          resume.publicId.startsWith(
            `resumeai/users/${studentUser._id}/resumes/`,
          ) &&
          resume.resourceType === "raw",
        );

        const resumeTextAvailable = Boolean(
          application.resumeName || application.resumeSource,
        );

        const appliedAt = application.submittedAt || application.createdAt;

        return {
          id: String(studentUser._id),
          name,
          initials: name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase(),

          email: studentUser.email || "",
          phone: firstValue(
            student.phone,
            student.phoneNumber,
            student.mobile,
            "",
          ),
          role: firstValue(
            student.currentRole,
            student.jobTitle,
            student.designation,
            "Candidate",
          ),
          location: firstValue(
            student.location,
            student.currentLocation,
            student.city,
            "Not specified",
          ),
          experience: firstValue(
            student.experienceLevel,
            student.totalExperience,
            student.experience,
            "Not specified",
          ),

          skills: asArray(
            student.skills || student.technicalSkills || student.skillSet,
          ).map((item) =>
            typeof item === "string"
              ? item
              : firstValue(item?.name, item?.skill, "Skill"),
          ),

          job: {
            id: String(job._id),
            title: job.title || "Untitled job",
            location: job.location || "",
            employmentType: job.employmentType || "",
          },

          applicationId: String(application._id),
          status: application.status || "pending",
          appliedDate: dateLabel(appliedAt),
          appliedAt: appliedAt || null,

          aiMatch: Number(analysis.score) || 0,

          resume: {
            name: firstValue(
              application.resumeName,
              resume.originalName,
              "Resume",
            ),
            source: application.resumeName
              ? application.resumeSource || "uploaded"
              : hasProfilePdf
                ? "profile"
                : application.resumeSource || "uploaded",
            pdfAvailable: hasProfilePdf,
            available: hasProfilePdf || resumeTextAvailable,
          },
        };
      })
      .filter(Boolean);

    // Search across candidate and job information.
    const searchRegex = search ? new RegExp(escapeRegex(search), "i") : null;

    let filteredCandidates = allCandidates;

    if (searchRegex) {
      filteredCandidates = filteredCandidates.filter((candidate) => {
        const searchableText = [
          candidate.name,
          candidate.email,
          candidate.role,
          candidate.location,
          candidate.job.title,
          candidate.job.location,
          ...candidate.skills,
        ].join(" ");

        return searchRegex.test(searchableText);
      });
    }

    if (status && status.toLowerCase() !== "all") {
      filteredCandidates = filteredCandidates.filter(
        (candidate) =>
          String(candidate.status).toLowerCase() === status.toLowerCase(),
      );
    }

    const total = filteredCandidates.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;

    const paginatedCandidates = filteredCandidates.slice(
      startIndex,
      startIndex + limit,
    );

    const normalizeStatus = (value) => String(value || "").toLowerCase();

    const stats = {
      total: allCandidates.length,
      pending: allCandidates.filter((item) =>
        ["pending", "applied", "under_review"].includes(
          normalizeStatus(item.status),
        ),
      ).length,
      shortlisted: allCandidates.filter((item) =>
        ["shortlisted", "interview", "selected"].includes(
          normalizeStatus(item.status),
        ),
      ).length,
      rejected: allCandidates.filter(
        (item) => normalizeStatus(item.status) === "rejected",
      ).length,
    };

    return NextResponse.json(
      {
        success: true,
        candidates: paginatedCandidates,
        jobs: jobs.map((job) => ({
          id: String(job._id),
          title: job.title || "Untitled job",
        })),
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Recruiter candidates GET error:", error);
    return errorResponse("Unable to load candidates right now.", 500);
  }
}
