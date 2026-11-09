import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import SavedJob from "@/app/models/SavedJob";
import { getAuthenticatedUser } from "@/lib/profile-auth";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
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

    const { jobId } = await params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID." },
        { status: 400 },
      );
    }

    await connectDB();

    await SavedJob.deleteOne({
      student: user._id,
      job: jobId,
    });

    return NextResponse.json({
      success: true,
      message: "Job removed from saved jobs.",
    });
  } catch (error) {
    console.error("DELETE saved job:", error);

    return NextResponse.json(
      { success: false, message: "Unable to remove saved job." },
      { status: 500 },
    );
  }
}
