import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";

import Assessment from "@/app/models/Assessment";
import Job from "@/app/models/Job";
import User from "@/app/models/User";
import { getAuthenticatedUser } from "@/lib/profile-auth";

export async function GET(request, context) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in to continue." },
        { status: 401 },
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student access only." },
        { status: 403 },
      );
    }

    const params = await context.params;
    const jobId = params?.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const [assessment, job] = await Promise.all([
      Assessment.findOne({
        student: user._id,
        job: jobId,
      }).select("-questions -answers"),
      Job.findById(jobId).select("title recruiter"),
    ]);

    if (!assessment || !assessment.result) {
      return NextResponse.json(
        { success: false, message: "No completed assessment was found." },
        { status: 404 },
      );
    }

    let companyName = "";

    if (job?.recruiter) {
      const recruiter = await User.findById(job.recruiter)
        .select("name")
        .lean();

      companyName = recruiter?.name || "";
    }

    return NextResponse.json({
      success: true,
      status: assessment.status,
      result: assessment.result,
      job: {
        title: job?.title || "Job Assessment",
        companyName,
      },
    });
  } catch (error) {
    console.error("Assessment result error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load the assessment result." },
      { status: 500 },
    );
  }
}
