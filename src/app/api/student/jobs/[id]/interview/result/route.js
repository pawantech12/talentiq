import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import Interview from "@/app/models/Interview";

export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user)
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 },
      );
    if (user.role !== "student")
      return NextResponse.json(
        { success: false, message: "Student access only." },
        { status: 403 },
      );

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID." },
        { status: 400 },
      );
    }

    await connectDB();
    const interview = await Interview.findOne({
      student: user._id,
      job: id,
      status: { $in: ["submitted", "expired"] },
    }).populate({
      path: "job",
      select: "title recruiter",
      populate: { path: "recruiter", select: "fullName" },
    });

    if (!interview?.result) {
      return NextResponse.json(
        { success: false, message: "No completed interview result was found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      result: {
        ...interview.result,
        jobTitle:
          interview.job?.title || interview.result.jobTitle || "Mock Interview",
        company:
          interview.job?.recruiter?.fullName ||
          interview.result.company ||
          "Company",
        questions: interview.questions.length,
        date: interview.submittedAt,
        durationSeconds: interview.durationSeconds,
        status: interview.status,
      },
    });
  } catch (error) {
    console.error("Interview result GET error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load interview result." },
      { status: 500 },
    );
  }
}
