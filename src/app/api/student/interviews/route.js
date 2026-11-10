import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import Application from "@/app/models/Application";
import Interview from "@/app/models/Interview";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 },
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student access only." },
        { status: 403 },
      );
    }

    await connectDB();

    const applications = await Application.find({
      student: user._id,
    })
      .populate({
        path: "job",
        select:
          "title industry location employmentType experienceLevel requiredSkills preferredSkills status publishedAt",
        populate: {
          path: "recruiter",
          select: "name profile",
        },
      })
      .sort({ submittedAt: -1 })
      .lean();

    const applicationIds = applications.map((app) => app._id);

    const interviews = await Interview.find({
      student: user._id,
      application: { $in: applicationIds },
    })
      .select(
        "application status durationSeconds startedAt expiresAt submittedAt result questions",
      )
      .lean();

    const interviewMap = new Map(
      interviews.map((interview) => [String(interview.application), interview]),
    );

    const jobs = applications
      .filter((application) => application.job)
      .map((application) => {
        const job = application.job;
        const recruiterProfile = job.recruiter?.profile?.recruiter || {};

        const company =
          recruiterProfile.companyName || job.recruiter?.name || "Company";

        const interview = interviewMap.get(String(application._id));

        let interviewStatus = "not_started";

        if (interview?.status === "in_progress") {
          interviewStatus = "in_progress";
        } else if (
          interview?.status === "submitted" ||
          interview?.status === "expired"
        ) {
          interviewStatus = "completed";
        }

        return {
          applicationId: String(application._id),
          jobId: String(job._id),

          title: job.title,
          company,
          companyInitials: company
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),

          industry: job.industry || "",
          location: job.location,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,

          requiredSkills: job.requiredSkills || [],
          preferredSkills: job.preferredSkills || [],

          applicationStatus: application.status,
          appliedAt: application.submittedAt,

          interview: interview
            ? {
                id: String(interview._id),
                status: interviewStatus,
                durationSeconds: interview.durationSeconds,
                startedAt: interview.startedAt,
                expiresAt: interview.expiresAt,
                submittedAt: interview.submittedAt,
                questionCount: interview.questions?.length || 0,
                result: interview.result || null,
              }
            : null,
        };
      });

    const stats = {
      total: jobs.length,
      notStarted: jobs.filter(
        (job) => job.interview?.status === "not_started" || !job.interview,
      ).length,
      inProgress: jobs.filter((job) => job.interview?.status === "in_progress")
        .length,
      completed: jobs.filter((job) => job.interview?.status === "completed")
        .length,
    };

    return NextResponse.json({
      success: true,
      jobs,
      stats,
    });
  } catch (error) {
    console.error("GET student interviews:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your interviews.",
      },
      { status: 500 },
    );
  }
}
