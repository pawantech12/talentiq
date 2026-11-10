import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/profile-auth";
import Application from "@/app/models/Application";
import Assessment from "@/app/models/Assessment";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to view your assessments.",
        },
        { status: 401 },
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        {
          success: false,
          message: "Only students can access this resource.",
        },
        { status: 403 },
      );
    }

    // Get all applications submitted by this student.
    const applications = await Application.find({
      student: user._id,
    })
      .select("_id job submittedAt")
      .populate({
        path: "job",
        select:
          "title industry location employmentType experienceLevel requiredSkills preferredSkills recruiter requireSkillAssessment assessmentType status",
        populate: {
          path: "recruiter",
          select: "fullName profile",
        },
      })
      .sort({ submittedAt: -1 })
      .lean();

    const applicationIds = applications.map((application) => application._id);

    // Fetch assessments for the student's applications.
    // Do not select questions or answers here: they are not needed
    // to display the assessment list or its saved result.
    const assessments = await Assessment.find({
      student: user._id,
      application: { $in: applicationIds },
    })
      .select(
        "_id job application status durationSeconds startedAt expiresAt submittedAt result",
      )
      .lean();

    const assessmentByApplication = new Map(
      assessments.map((assessment) => [
        String(assessment.application),
        assessment,
      ]),
    );

    const now = new Date();

    const allJobs = applications
      .filter(
        (application) =>
          application.job && application.job.requireSkillAssessment === true,
      )
      .map((application) => {
        const job = application.job;
        const recruiter = job.recruiter;

        const company =
          recruiter?.profile?.recruiter?.companyName ||
          recruiter?.profile?.companyName ||
          recruiter?.fullName ||
          "Company";

        const assessment = assessmentByApplication.get(String(application._id));

        let assessmentStatus = "not_started";

        if (assessment) {
          assessmentStatus = assessment.status || "not_started";

          // Treat an in-progress assessment whose timer has elapsed
          // as expired, even if MongoDB has not been updated yet.
          if (
            assessmentStatus === "in_progress" &&
            assessment.expiresAt &&
            new Date(assessment.expiresAt) <= now
          ) {
            assessmentStatus = "expired";
          }
        }

        return {
          applicationId: String(application._id),
          jobId: String(job._id),
          title: job.title,
          company,
          companyInitials: company
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          industry: job.industry || "",
          location: job.location || "",
          employmentType: job.employmentType || "",
          experienceLevel: job.experienceLevel || "",
          requiredSkills: job.requiredSkills || [],
          preferredSkills: job.preferredSkills || [],
          requireSkillAssessment: job.requireSkillAssessment,
          assessmentType: job.assessmentType || "Job-Specific Skill Assessment",
          appliedAt: application.submittedAt,

          assessment: assessment
            ? {
                assessmentId: String(assessment._id),
                status: assessmentStatus,
                durationSeconds: assessment.durationSeconds || 900,
                startedAt: assessment.startedAt,
                expiresAt: assessment.expiresAt,
                submittedAt: assessment.submittedAt,

                // The saved result is used by the completed assessment card
                // and the result page. It belongs to this authenticated student.
                result:
                  assessmentStatus === "submitted"
                    ? assessment.result || null
                    : null,
              }
            : null,
        };
      });

    // Count each status across all assessment-required applications.
    const stats = {
      total: allJobs.length,

      notStarted: allJobs.filter((job) => !job.assessment).length,

      inProgress: allJobs.filter(
        (job) => job.assessment?.status === "in_progress",
      ).length,

      expired: allJobs.filter((job) => job.assessment?.status === "expired")
        .length,

      completed: allJobs.filter((job) => job.assessment?.status === "submitted")
        .length,

      pending: allJobs.filter(
        (job) =>
          !job.assessment ||
          ["not_started", "in_progress", "expired"].includes(
            job.assessment.status,
          ),
      ).length,
    };

    // Return all assessments, including completed ones.
    return NextResponse.json({
      success: true,
      jobs: allJobs,
      stats,
    });
  } catch (error) {
    console.error("Student assessments GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your assessments.",
      },
      { status: 500 },
    );
  }
}
