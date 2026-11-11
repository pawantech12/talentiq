import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAuthenticatedUser } from "@/lib/profile-auth";

import Job from "@/app/models/Job";
import Application from "@/app/models/Application";
import { connectDB } from "@/lib/mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedStatuses = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Rejected",
];

const errorResponse = (message, status = 400) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
};

export async function PATCH(request, { params }) {
  try {
    // 1. Authenticate recruiter
    const authResult = await getAuthenticatedUser(request);

    const recruiter = authResult?.user || authResult;

    if (!recruiter?._id) {
      return errorResponse("Authentication required.", 401);
    }

    if (recruiter.role !== "recruiter") {
      return errorResponse("Recruiter access only.", 403);
    }

    if (recruiter.accountStatus === "disabled") {
      return errorResponse("Your account is disabled.", 403);
    }

    // 2. Get route parameters
    const { id: jobId, applicationId } = await params;

    // 3. Validate IDs
    if (
      !mongoose.isValidObjectId(jobId) ||
      !mongoose.isValidObjectId(applicationId)
    ) {
      return errorResponse("Invalid job or application ID.", 400);
    }

    // 4. Read request body
    const body = await request.json().catch(() => null);

    const status = body?.status;

    // 5. Validate status
    if (!allowedStatuses.includes(status)) {
      return errorResponse(
        `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        422,
      );
    }

    // 6. Connect database
    await connectDB();

    // 7. Verify recruiter owns the job
    const job = await Job.findOne({
      _id: jobId,
      recruiter: recruiter._id,
    })
      .select("_id")
      .lean();

    if (!job) {
      return errorResponse(
        "Job not found or you do not have access to it.",
        404,
      );
    }

    // 8. Update application
    // Application must belong to this exact job.
    const application = await Application.findOneAndUpdate(
      {
        _id: applicationId,
        job: jobId,
      },
      {
        $set: {
          status,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("_id status");

    if (!application) {
      return errorResponse("Application not found for this job.", 404);
    }

    // 9. Return updated application
    return NextResponse.json(
      {
        success: true,
        message: "Application status updated successfully.",

        application: {
          id: String(application._id),
          status: application.status,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Recruiter application status PATCH error:", error);

    return errorResponse("Unable to update application status right now.", 500);
  }
}
