import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import cloudinary from "@/lib/cloudinary";

import User from "@/app/models/User";
import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import { connectDB } from "@/lib/mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const recruiter = await getAuthenticatedUser();

    if (!recruiter || recruiter.role !== "recruiter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: candidateId } = await params;
    const { searchParams } = new URL(request.url);

    const jobId = searchParams.get("jobId");
    const applicationId = searchParams.get("applicationId");
    const shouldDownload = searchParams.get("download") === "1";

    if (!candidateId || !jobId || !applicationId) {
      return NextResponse.json(
        { message: "Candidate, job, or application ID is missing." },
        { status: 400 },
      );
    }

    // Confirm that this job belongs to the logged-in recruiter.
    const job = await Job.findOne({
      _id: jobId,
      recruiter: recruiter._id,
    }).select("_id");

    if (!job) {
      return NextResponse.json(
        { message: "Job not found or access denied." },
        { status: 404 },
      );
    }

    // Confirm that this application belongs to this candidate and job.
    const application = await Application.findOne({
      _id: applicationId,
      student: candidateId,
      job: jobId,
    }).select("_id");

    if (!application) {
      return NextResponse.json(
        { message: "Application not found or access denied." },
        { status: 404 },
      );
    }

    const candidate = await User.findOne({
      _id: candidateId,
      role: "student",
    }).select("profile");

    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found." },
        { status: 404 },
      );
    }

    const resume = candidate.profile?.student?.resume;

    if (!resume?.publicId) {
      return NextResponse.json(
        { message: "Candidate has not uploaded a PDF resume." },
        { status: 404 },
      );
    }

    // Only allow this candidate's own resume folder.
    const expectedFolder = `resumeai/users/${candidate._id}/resumes/`;

    if (
      typeof resume.publicId !== "string" ||
      !resume.publicId.startsWith(expectedFolder) ||
      resume.resourceType !== "raw"
    ) {
      return NextResponse.json(
        { message: "Invalid resume file." },
        { status: 403 },
      );
    }

    const signedUrl = cloudinary.url(resume.publicId, {
      resource_type: "raw",
      type: "upload",
      secure: true,
      sign_url: true,
    });

    // Forward range requests so the browser's PDF viewer can load pages.
    const range = request.headers.get("range");

    const upstream = await fetch(signedUrl, {
      method: "GET",
      headers: range ? { Range: range } : {},
      cache: "no-store",
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error("Candidate resume retrieval failed:", {
        status: upstream.status,
        publicId: resume.publicId,
      });

      return NextResponse.json(
        { message: "Unable to retrieve candidate resume." },
        { status: 502 },
      );
    }

    const headers = new Headers();

    const safeFilename = (resume.originalName || "resume.pdf").replace(
      /[\\/"\r\n]/g,
      "_",
    );

    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `${shouldDownload ? "attachment" : "inline"}; filename="${safeFilename}"`,
    );
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");
    const contentLength = upstream.headers.get("content-length");

    if (contentRange) headers.set("Content-Range", contentRange);
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("Recruiter candidate resume error:", error);

    return NextResponse.json(
      { message: "Unable to display candidate resume." },
      { status: 500 },
    );
  }
}
