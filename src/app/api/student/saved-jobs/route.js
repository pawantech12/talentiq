import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Job from "@/app/models/Job";
import SavedJob from "@/app/models/SavedJob";
import { getAuthenticatedUser } from "@/lib/profile-auth";

export const runtime = "nodejs";

async function requireStudent() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 },
      ),
    };
  }

  if (user.role !== "student") {
    return {
      response: NextResponse.json(
        { success: false, message: "Student access only." },
        { status: 403 },
      ),
    };
  }

  return { user };
}

export async function GET() {
  try {
    const auth = await requireStudent();
    if (auth.response) return auth.response;

    await connectDB();

    const saved = await SavedJob.find({
      student: auth.user._id,
    }).select("job");

    return NextResponse.json({
      success: true,
      savedJobIds: saved.map((item) => String(item.job)),
    });
  } catch (error) {
    console.error("GET saved jobs:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load saved jobs." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireStudent();
    if (auth.response) return auth.response;

    const { jobId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, message: "Invalid job ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const job = await Job.findOne({
      _id: jobId,
      status: "Active",
    }).select("_id");

    if (!job) {
      return NextResponse.json(
        { success: false, message: "This job is no longer available." },
        { status: 404 },
      );
    }

    await SavedJob.updateOne(
      { student: auth.user._id, job: jobId },
      { $setOnInsert: { student: auth.user._id, job: jobId } },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      message: "Job saved.",
    });
  } catch (error) {
    console.error("POST saved job:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save job." },
      { status: 500 },
    );
  }
}
