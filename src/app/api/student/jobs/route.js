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

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueSorted(values) {
  return [
    ...new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

function makeExactRegex(value) {
  return new RegExp(`^${escapeRegex(value.trim())}$`, "i");
}

export async function GET(request) {
  try {
    const auth = await requireStudent();
    if (auth.response) return auth.response;

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const location = (searchParams.get("location") || "").trim();
    const experience = (searchParams.get("experience") || "").trim();
    const employmentType = (searchParams.get("employmentType") || "").trim();
    const skill = (searchParams.get("skill") || "").trim();
    const education = (searchParams.get("education") || "").trim();
    const sortBy = searchParams.get("sortBy") || "Best Match";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 4),
    );

    const activeJobsFilter = { status: "Active" };

    // Build filter options from ALL active jobs, not just the current page.
    const [
      locations,
      experiences,
      employmentTypes,
      requiredSkills,
      preferredSkills,
      educationRequirements,
    ] = await Promise.all([
      Job.distinct("location", activeJobsFilter),
      Job.distinct("experienceLevel", activeJobsFilter),
      Job.distinct("employmentType", activeJobsFilter),
      Job.distinct("requiredSkills", activeJobsFilter),
      Job.distinct("preferredSkills", activeJobsFilter),
      Job.distinct("educationRequirement", activeJobsFilter),
    ]);

    const filters = {
      locations: uniqueSorted(locations),
      experiences: uniqueSorted(experiences),
      employmentTypes: uniqueSorted(employmentTypes),
      skills: uniqueSorted([...requiredSkills, ...preferredSkills]),
      education: uniqueSorted(educationRequirements),
    };

    // Start with active jobs only.
    const filter = { ...activeJobsFilter };

    if (location && location !== "All Locations") {
      filter.location = makeExactRegex(location);
    }

    if (experience && experience !== "Any Experience") {
      filter.experienceLevel = makeExactRegex(experience);
    }

    if (employmentType && employmentType !== "All Types") {
      filter.employmentType = makeExactRegex(employmentType);
    }

    if (skill && skill !== "All Skills") {
      const skillRegex = makeExactRegex(skill);

      filter.$or = [
        { requiredSkills: skillRegex },
        { preferredSkills: skillRegex },
      ];
    }

    if (education && education !== "All Education") {
      filter.educationRequirement = makeExactRegex(education);
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      const searchConditions = [
        { title: searchRegex },
        { industry: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
        { responsibilities: searchRegex },
        { requiredSkills: searchRegex },
        { preferredSkills: searchRegex },
        { educationRequirement: searchRegex },
      ];

      // Combine search with any already-selected skill filter.
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const sort =
      sortBy === "A–Z" || sortBy === "A-Z"
        ? { title: 1 }
        : { publishedAt: -1, createdAt: -1 };

    const [total, jobs] = await Promise.all([
      Job.countDocuments(filter),

      Job.find(filter)
        .populate("recruiter", "name profile")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const formattedJobs = jobs.map((job) => {
      const recruiterProfile = job.recruiter?.profile?.recruiter || {};
      const company =
        recruiterProfile.companyName || job.recruiter?.name || "Company";

      return {
        ...job,
        company,
        recruiterName:
          recruiterProfile.recruiterName || job.recruiter?.name || "",
        companyInitials: company
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
      filters,
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
