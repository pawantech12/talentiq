import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Job from "@/app/models/Job";
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

export async function GET(request) {
  try {
    const auth = await requireStudent();
    if (auth.response) return auth.response;

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const location = searchParams.get("location") || "";
    const experience = searchParams.get("experience") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const skill = searchParams.get("skill") || "";
    const education = searchParams.get("education") || "";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 8),
    );

    const filter = { status: "Active" };

    if (location && location !== "All Locations") {
      filter.location = location;
    }

    if (experience && experience !== "Any Experience") {
      filter.experienceLevel = experience;
    }

    if (employmentType && employmentType !== "All Types") {
      filter.employmentType = employmentType;
    }

    if (skill && skill !== "All Skills") {
      filter.requiredSkills = {
        $regex: `^${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }

    if (education && education !== "All Education") {
      filter.educationRequirement = education;
    }

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeSearch, "i");

      filter.$or = [
        { title: regex },
        { industry: regex },
        { location: regex },
        { description: regex },
        { requiredSkills: regex },
        { preferredSkills: regex },
      ];
    }

    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate("recruiter", "name email profile")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedJobs = jobs.map((job) => {
      const recruiterProfile = job.recruiter?.profile?.recruiter || {};

      return {
        ...job,
        company:
          recruiterProfile.companyName || job.recruiter?.name || "Company",
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
    });

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET student jobs:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load jobs." },
      { status: 500 },
    );
  }
}
