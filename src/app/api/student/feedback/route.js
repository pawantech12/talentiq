import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Application from "@/app/models/Application";
import Feedback from "@/app/models/Feedback";
import Job from "@/app/models/Job";
import User from "@/app/models/User";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import { connectDB } from "@/lib/mongoose";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Recruiter Communication",
  "Interview Experience",
  "Job Description",
  "Hiring Process",
  "Overall Experience",
];

function getRecruiterName(recruiter) {
  return recruiter?.fullName || "Recruiter";
}

function getCompanyName(recruiter) {
  const profile = recruiter?.profile || {};

  return (
    profile.companyName ||
    profile.company ||
    profile.organizationName ||
    "Company"
  );
}

function getErrorMessage(error) {
  if (error?.name === "ValidationError") {
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  return "Something went wrong. Please try again.";
}

async function authenticateStudent() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      ),
    };
  }

  if (user.role !== "student") {
    return {
      error: NextResponse.json(
        { success: false, message: "Student access required." },
        { status: 403 },
      ),
    };
  }

  if (user.accountStatus === "disabled") {
    return {
      error: NextResponse.json(
        { success: false, message: "Your account is disabled." },
        { status: 403 },
      ),
    };
  }

  return { user };
}

// GET: List the student's applications and their feedback.
export async function GET() {
  try {
    const { user, error } = await authenticateStudent();

    if (error) return error;

    await connectDB();

    const applications = await Application.find({
      student: user._id,
    })
      .select("_id job status submittedAt")
      .populate({
        path: "job",
        select: "title location employmentType recruiter",
        populate: {
          path: "recruiter",
          select: "fullName profile",
          model: User,
        },
      })
      .sort({ submittedAt: -1 })
      .lean();

    const applicationIds = applications.map((item) => item._id);

    const feedbackEntries = await Feedback.find({
      student: user._id,
      application: { $in: applicationIds },
    }).lean();

    const feedbackMap = new Map(
      feedbackEntries.map((item) => [item.application.toString(), item]),
    );

    const data = applications
      .filter((application) => application.job)
      .map((application) => {
        const job = application.job;
        const recruiter = job.recruiter;
        const feedback = feedbackMap.get(application._id.toString());

        return {
          applicationId: application._id.toString(),
          jobId: job._id.toString(),
          jobTitle: job.title,
          location: job.location,
          employmentType: job.employmentType,
          applicationStatus: application.status,
          appliedAt: application.submittedAt,
          recruiterName: getRecruiterName(recruiter),
          companyName: getCompanyName(recruiter),
          feedback: feedback
            ? {
                id: feedback._id.toString(),
                rating: feedback.rating,
                communicationRating: feedback.communicationRating,
                processRating: feedback.processRating,
                category: feedback.category,
                title: feedback.title,
                message: feedback.message,
                wouldRecommend: feedback.wouldRecommend,
                updatedAt: feedback.updatedAt,
              }
            : null,
        };
      });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Student feedback GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your feedback.",
      },
      { status: 500 },
    );
  }
}

// POST: Create or update feedback for an application.
export async function POST(request) {
  try {
    const { user, error } = await authenticateStudent();

    if (error) return error;

    await connectDB();

    const body = await request.json();

    const {
      applicationId,
      rating,
      communicationRating,
      processRating,
      category,
      title,
      message,
      wouldRecommend,
    } = body;

    if (!mongoose.Types.ObjectId.isValid(applicationId || "")) {
      return NextResponse.json(
        { success: false, message: "Invalid application." },
        { status: 400 },
      );
    }

    const ratings = [rating, communicationRating, processRating];

    if (
      ratings.some(
        (value) => !Number.isInteger(value) || value < 1 || value > 5,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All ratings must be between 1 and 5.",
        },
        { status: 400 },
      );
    }

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid feedback category." },
        { status: 400 },
      );
    }

    if (
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Title must be between 3 and 100 characters.",
        },
        { status: 400 },
      );
    }

    if (
      typeof message !== "string" ||
      message.trim().length < 20 ||
      message.trim().length > 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback must be between 20 and 2000 characters.",
        },
        { status: 400 },
      );
    }

    if (typeof wouldRecommend !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select whether you would recommend this opportunity.",
        },
        { status: 400 },
      );
    }

    // Verify that this application belongs to the logged-in student.
    const application = await Application.findOne({
      _id: applicationId,
      student: user._id,
    }).populate({
      path: "job",
      select: "recruiter",
    });

    if (!application || !application.job) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found.",
        },
        { status: 404 },
      );
    }

    const feedback = await Feedback.findOneAndUpdate(
      {
        student: user._id,
        application: application._id,
      },
      {
        $set: {
          student: user._id,
          recruiter: application.job.recruiter,
          job: application.job._id,
          application: application._id,
          rating,
          communicationRating,
          processRating,
          category,
          title: title.trim(),
          message: message.trim(),
          wouldRecommend,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Your feedback has been saved successfully.",
        data: {
          id: feedback._id,
          rating: feedback.rating,
          communicationRating: feedback.communicationRating,
          processRating: feedback.processRating,
          category: feedback.category,
          title: feedback.title,
          message: feedback.message,
          wouldRecommend: feedback.wouldRecommend,
          updatedAt: feedback.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Student feedback POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
