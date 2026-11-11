import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";

import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";
import Job from "@/app/models/Job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clamp(value, min = 0, max = 100) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(min, Math.min(max, Math.round(number)))
    : 0;
}

function getStudentSkills(profile = {}) {
  const studentProfile = profile.student || {};

  const possibleSkills = [
    profile.skills,
    profile.technicalSkills,
    studentProfile.skills,
    studentProfile.technicalSkills,
    profile.resume?.skills,
  ];

  return [
    ...new Set(
      possibleSkills
        .flatMap((item) => {
          if (Array.isArray(item)) return item;
          if (typeof item === "string") return item.split(",");
          return [];
        })
        .map((skill) =>
          typeof skill === "string"
            ? skill.trim().toLowerCase()
            : typeof skill?.name === "string"
              ? skill.name.trim().toLowerCase()
              : "",
        )
        .filter(Boolean),
    ),
  ];
}

function getCompanyName(recruiter) {
  return (
    recruiter?.profile?.recruiter?.companyName ||
    recruiter?.profile?.companyName ||
    recruiter?.fullName ||
    "Company"
  );
}

function getInitials(value = "") {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "JB"
  );
}

function getRelativeDate(date) {
  if (!date) return "";

  const timestamp = new Date(date).getTime();

  if (!Number.isFinite(timestamp)) return "";

  const appliedDate = new Date(timestamp);
  const today = new Date();

  // Normalize both dates to local midnight
  const appliedDay = new Date(
    appliedDate.getFullYear(),
    appliedDate.getMonth(),
    appliedDate.getDate(),
  );

  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const differenceInDays = Math.round(
    (todayDay.getTime() - appliedDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (differenceInDays <= 0) return "Today";
  if (differenceInDays === 1) return "1 day ago";
  if (differenceInDays < 7) return `${differenceInDays} days ago`;
  if (differenceInDays < 14) return "1 week ago";
  if (differenceInDays < 30)
    return `${Math.floor(differenceInDays / 7)} weeks ago`;
  if (differenceInDays < 60) return "1 month ago";

  return appliedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatus(status) {
  switch (status) {
    case "Shortlisted":
      return { status: "Shortlisted", statusType: "green" };

    case "Under Review":
      return { status: "Under Review", statusType: "yellow" };

    case "Rejected":
      return { status: "Rejected", statusType: "red" };

    default:
      return { status: "Applied", statusType: "blue" };
  }
}

function getExperienceLabel(value = "") {
  return value || "Experience not specified";
}

function calculateJobMatch(job, studentSkills) {
  const required = (job.requiredSkills || []).map((skill) =>
    String(skill).trim().toLowerCase(),
  );

  const preferred = (job.preferredSkills || []).map((skill) =>
    String(skill).trim().toLowerCase(),
  );

  const allSkills = [...new Set([...required, ...preferred])];

  if (!allSkills.length || !studentSkills.length) {
    return clamp(job.aiMatch || 0);
  }

  const matchedRequired = required.filter((skill) =>
    studentSkills.includes(skill),
  ).length;

  const matchedPreferred = preferred.filter((skill) =>
    studentSkills.includes(skill),
  ).length;

  const requiredScore = required.length
    ? (matchedRequired / required.length) * 70
    : 70;

  const preferredScore = preferred.length
    ? (matchedPreferred / preferred.length) * 30
    : 30;

  const calculated = requiredScore + preferredScore;

  return clamp(calculated || job.aiMatch || 0);
}

function getSkillGap(applications, jobs) {
  const missingSkills = applications.flatMap(
    (application) => application.analysis?.missingSkills || [],
  );

  const counts = new Map();

  for (const skill of missingSkills) {
    if (typeof skill !== "string" || !skill.trim()) continue;

    const normalized = skill.trim();
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }

  if (counts.size) {
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  const jobSkills = jobs.flatMap((job) => job.requiredSkills || []);
  const frequency = new Map();

  for (const skill of jobSkills) {
    if (typeof skill !== "string" || !skill.trim()) continue;

    frequency.set(skill, (frequency.get(skill) || 0) + 1);
  }

  return (
    [...frequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Technical skills"
  );
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

    if (user.accountStatus !== "active") {
      return NextResponse.json(
        { success: false, message: "Your account is disabled." },
        { status: 403 },
      );
    }

    await connectDB();

    const [applicationRecords, allActiveJobs] = await Promise.all([
      Application.find({ student: user._id })
        .select("job analysis status submittedAt createdAt")
        .populate({
          path: "job",
          select:
            "title location employmentType experienceLevel requiredSkills preferredSkills recruiter status aiMatch",
          populate: {
            path: "recruiter",
            select: "fullName profile",
          },
        })
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean(),

      Job.find({ status: "Active" })
        .select(
          "title location employmentType experienceLevel requiredSkills preferredSkills recruiter aiMatch publishedAt createdAt",
        )
        .populate("recruiter", "fullName profile")
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(30)
        .lean(),
    ]);

    const applicationIds = applicationRecords.map((item) => item._id);

    const assessments = applicationIds.length
      ? await Assessment.find({
          student: user._id,
          application: { $in: applicationIds },
        })
          .select("application status submittedAt")
          .lean()
      : [];

    const submittedAssessments = assessments.filter(
      (assessment) => assessment.status === "submitted",
    ).length;

    const assessmentByApplication = new Map(
      assessments.map((assessment) => [
        String(assessment.application),
        assessment,
      ]),
    );

    const applications = applicationRecords.map((application) => {
      const job = application.job;
      const assessment = assessmentByApplication.get(String(application._id));

      const appliedAt = application.submittedAt || application.createdAt;
      const match =
        typeof application.analysis?.score === "number"
          ? clamp(application.analysis.score)
          : null;

      const statusInfo = getStatus(application.status);

      return {
        id: String(application._id),
        jobId: job?._id ? String(job._id) : null,
        job: job?.title || "Job no longer available",
        company: getCompanyName(job?.recruiter),
        initials: getInitials(getCompanyName(job?.recruiter)),
        color: "blue",
        applied: getRelativeDate(appliedAt),
        appliedAt: appliedAt ? new Date(appliedAt).toISOString() : null,
        match: match === null ? "—" : `${match}%`,
        matchValue: match,
        assessmentStatus: assessment?.status || "not_started",
        ...statusInfo,
      };
    });

    const studentSkills = getStudentSkills(user.profile || {});

    const appliedJobIds = new Set(
      applicationRecords.map((application) =>
        application.job?._id
          ? String(application.job._id)
          : String(application.job),
      ),
    );

    const recommendedJobs = allActiveJobs
      .filter((job) => !appliedJobIds.has(String(job._id)))
      .map((job) => {
        const company = getCompanyName(job.recruiter);
        const match = calculateJobMatch(job, studentSkills);

        return {
          id: String(job._id),
          title: job.title,
          company,
          companyInitials: getInitials(company),
          companyColor: "blue",
          location: job.location || "Location not specified",
          type: job.employmentType || "Not specified",
          experience: getExperienceLabel(job.experienceLevel),
          match,
          skills: (job.requiredSkills || []).slice(0, 4),
        };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);

    const scoredApplications = applicationRecords
      .map((item) => item.analysis?.score)
      .filter(
        (score) =>
          typeof score === "number" && Number.isFinite(score) && score >= 0,
      );

    const averageMatch = scoredApplications.length
      ? clamp(
          scoredApplications.reduce((sum, score) => sum + score, 0) /
            scoredApplications.length,
        )
      : 0;

    const shortlisted = applicationRecords.filter(
      (item) => item.status === "Shortlisted",
    ).length;

    const latestAnalysis = applicationRecords.find(
      (item) => item.analysis?.breakdown,
    )?.analysis;

    const breakdown = latestAnalysis?.breakdown || {};

    const resumeScore =
      typeof latestAnalysis?.score === "number"
        ? clamp(latestAnalysis.score)
        : null;

    const topSkillGap = getSkillGap(applicationRecords, allActiveJobs);

    const recommendedAction = `Practice ${topSkillGap} concepts before your next application.`;

    return NextResponse.json({
      success: true,
      student: {
        id: String(user._id),
        fullName: user.fullName || "Student",
        firstName: user.fullName?.trim().split(/\s+/)[0] || "Student",
      },

      stats: {
        applications: applicationRecords.length,
        shortlisted,
        assessments: submittedAssessments,
        averageMatch,
      },

      recommendedJobs,

      applications: applications.slice(0, 5),

      careerInsight: {
        topSkillGap,
        recommendedAction,
      },

      resume: {
        score: resumeScore,
        breakdown: {
          skills:
            typeof breakdown.skill === "number" ? clamp(breakdown.skill) : null,
          experience:
            typeof breakdown.experience === "number"
              ? clamp(breakdown.experience)
              : null,
          education:
            typeof breakdown.education === "number"
              ? clamp(breakdown.education)
              : null,
        },
      },
    });
  } catch (error) {
    console.error("Student dashboard API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load your dashboard." },
      { status: 500 },
    );
  }
}
