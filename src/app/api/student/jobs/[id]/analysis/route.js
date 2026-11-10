import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import Job from "@/app/models/Job";
import Application from "@/app/models/Application";

export const runtime = "nodejs";

export async function GET(request, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const job = await Job.findById(id)
      .populate("recruiter", "fullName profile")
      .lean();

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found." },
        { status: 404 },
      );
    }

    const application = await Application.findOne({
      student: user._id,
      job: job._id,
    })
      .select("+resumeText")
      .lean();

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          code: "APPLICATION_NOT_FOUND",
          message: "Submit your application before viewing its analysis.",
        },
        { status: 404 },
      );
    }

    const company =
      job.recruiter?.profile?.recruiter?.companyName ||
      job.recruiter?.fullName ||
      "Company";

    return NextResponse.json({
      success: true,
      job: {
        id: String(job._id),
        title: job.title,
        company,
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        requiredSkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        educationRequirement: job.educationRequirement || "",
        requireSkillAssessment: Boolean(job.requireSkillAssessment),
        assessmentType: job.assessmentType || "",
      },
      application: {
        id: String(application._id),
        resumeName: application.resumeName,
        resumeSource: application.resumeSource,
        status: application.status,
        submittedAt: application.submittedAt,
        analyzedAt: application.analyzedAt,
      },
      analysis: application.analysis,
    });
  } catch (error) {
    console.error("GET student analysis:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load your resume analysis." },
      { status: 500 },
    );
  }
}
