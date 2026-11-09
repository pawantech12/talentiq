import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Job from "@/app/models/Job";
import { getAuthenticatedUser } from "@/lib/profile-auth";

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

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID." },
        { status: 400 },
      );
    }

    const job = await Job.findOne({
      _id: id,
      status: "Active",
    })
      .populate("recruiter", "name email profile")
      .lean();

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found or no longer active." },
        { status: 404 },
      );
    }

    const recruiterProfile = job.recruiter?.profile?.recruiter || {};

    const formattedJob = {
      ...job,
      company: recruiterProfile.companyName || job.recruiter?.name || "Company",
      recruiterName:
        recruiterProfile.recruiterName || job.recruiter?.name || "",
      companyInitials: (
        recruiterProfile.companyName ||
        job.recruiter?.name ||
        "CO"
      )
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };

    return NextResponse.json({
      success: true,
      job: formattedJob,
    });
  } catch (error) {
    console.error("GET student job details:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load job details." },
      { status: 500 },
    );
  }
}
