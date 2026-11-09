import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Job from "@/app/models/Job";
import { requireRecruiter, normalizeJobInput, validateJob } from "@/lib/recruiter-jobs";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const auth = await requireRecruiter();
    if (auth.response) return auth.response;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const filter = { recruiter: auth.user._id };
    if (["Active", "Draft", "Closed"].includes(status)) filter.status = status;

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    const stats = await Job.aggregate([
      { $match: { recruiter: auth.user._id } },
      { $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        activeJobs: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
        closedJobs: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
        totalApplications: { $sum: "$applicationCount" },
      } },
    ]);

    return NextResponse.json({
      success: true,
      jobs,
      stats: stats[0] || { totalJobs: 0, activeJobs: 0, closedJobs: 0, totalApplications: 0 },
    });
  } catch (error) {
    console.error("GET recruiter jobs:", error);
    return NextResponse.json({ success: false, message: "Unable to load jobs." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireRecruiter();
    if (auth.response) return auth.response;

    const body = await request.json();
    const jobData = normalizeJobInput(body);
    const error = validateJob(jobData);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    if (jobData.status === "Active") jobData.publishedAt = new Date();

    await connectDB();
    const job = await Job.create({ ...jobData, recruiter: auth.user._id });
    return NextResponse.json({ success: true, message: "Job saved.", job }, { status: 201 });
  } catch (error) {
    console.error("POST recruiter jobs:", error);
    return NextResponse.json({ success: false, message: "Unable to save job." }, { status: 500 });
  }
}
