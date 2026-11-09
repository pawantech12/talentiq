import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Job from "@/app/models/Job";
import { requireRecruiter, normalizeJobInput, validateJob } from "@/lib/recruiter-jobs";

export const runtime = "nodejs";

async function findOwnedJob(id, recruiterId) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return Job.findOne({ _id: id, recruiter: recruiterId });
}

export async function GET(_request, { params }) {
  try {
    const auth = await requireRecruiter();
    if (auth.response) return auth.response;
    const { id } = await params;
    const job = await findOwnedJob(id, auth.user._id);
    if (!job) return NextResponse.json({ success: false, message: "Job not found." }, { status: 404 });
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("GET recruiter job:", error);
    return NextResponse.json({ success: false, message: "Unable to load job." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireRecruiter();
    if (auth.response) return auth.response;
    const { id } = await params;
    const job = await findOwnedJob(id, auth.user._id);
    if (!job) return NextResponse.json({ success: false, message: "Job not found." }, { status: 404 });

    const body = await request.json();
    const nextStatus = ["Active", "Draft", "Closed"].includes(body.status) ? body.status : job.status;
    const jobData = normalizeJobInput({ ...job.toObject(), ...body, status: nextStatus });
    const error = validateJob(jobData);
    if (nextStatus === "Active" && error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    Object.assign(job, jobData);
    if (nextStatus === "Active" && !job.publishedAt) job.publishedAt = new Date();
    await job.save();

    return NextResponse.json({ success: true, message: "Job updated.", job });
  } catch (error) {
    console.error("PATCH recruiter job:", error);
    return NextResponse.json({ success: false, message: "Unable to update job." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const auth = await requireRecruiter();
    if (auth.response) return auth.response;
    const { id } = await params;
    const job = await findOwnedJob(id, auth.user._id);
    if (!job) return NextResponse.json({ success: false, message: "Job not found." }, { status: 404 });
    await job.deleteOne();
    return NextResponse.json({ success: true, message: "Job deleted." });
  } catch (error) {
    console.error("DELETE recruiter job:", error);
    return NextResponse.json({ success: false, message: "Unable to delete job." }, { status: 500 });
  }
}
