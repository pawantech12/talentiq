import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultStudentProfile = {
  phone: "",
  location: "",
  dob: "",
  role: "",
  currentRole: "",
  careerGoal: "",
  preferredLocation: "",
  experienceLevel: "Fresher",
  expectedRole: "",
  skills: [],
  education: [],
  experiences: [],
  projects: [],
  portfolioLinks: [],
  resume: null,
};

function getOldProfile(user) {
  return user.profile?.toObject?.() || user.profile || {};
}

function getStudentProfile(user) {
  const oldProfile = getOldProfile(user);
  const student = oldProfile.student || {};

  return {
    ...defaultStudentProfile,
    ...student,
    skills: Array.isArray(student.skills)
      ? student.skills
      : Array.isArray(oldProfile.primarySkills)
        ? oldProfile.primarySkills
        : [],
    education:
      Array.isArray(student.education) && student.education.length
        ? student.education
        : oldProfile.education
          ? [{ degree: oldProfile.education, university: "", period: "" }]
          : [],
    experiences: Array.isArray(student.experiences) ? student.experiences : [],
    projects: Array.isArray(student.projects) ? student.projects : [],
    portfolioLinks: Array.isArray(student.portfolioLinks)
      ? student.portfolioLinks
      : [],
  };
}

function getRecruiterProfile(user) {
  const oldProfile = getOldProfile(user);
  const recruiter = oldProfile.recruiter || {};

  // Support older registrations that stored these directly under profile.
  return {
    recruiterName: recruiter.recruiterName || user.fullName || "",
    companyName: recruiter.companyName || oldProfile.companyName || "",
    phone: recruiter.phone || "",
    location: recruiter.location || "",
    jobTitle: recruiter.jobTitle || "",
    department: recruiter.department || "",
    experience: recruiter.experience || "",
  };
}

function getProjectMediaIds(projects = []) {
  return new Set(
    projects.flatMap((project) =>
      (Array.isArray(project.media) ? project.media : [])
        .map((item) => item?.publicId)
        .filter(Boolean),
    ),
  );
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const commonProfile = {
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified !== false,
      accountStatus: user.accountStatus || "active",
    };

    if (user.role === "student") {
      return NextResponse.json({
        success: true,
        profile: {
          ...commonProfile,
          ...getStudentProfile(user),
        },
      });
    }

    if (user.role === "recruiter") {
      return NextResponse.json({
        success: true,
        profile: {
          ...commonProfile,
          ...getRecruiterProfile(user),
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported account type" },
      { status: 403 },
    );
  } catch (error) {
    console.error("GET profile error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 },
      );
    }

    // Email changes are intentionally not accepted here.
    // Use a separate email-verification flow to change the account email.
    if (Object.hasOwn(body, "email")) {
      return NextResponse.json(
        {
          success: false,
          message: "Email changes require email verification.",
        },
        { status: 400 },
      );
    }

    if (Object.hasOwn(body, "fullName")) {
      if (
        typeof body.fullName !== "string" ||
        body.fullName.trim().length < 2 ||
        body.fullName.trim().length > 100
      ) {
        return NextResponse.json(
          { success: false, message: "Enter a valid full name" },
          { status: 400 },
        );
      }

      user.fullName = body.fullName.trim();
    }

    const oldProfile = getOldProfile(user);

    if (user.role === "recruiter") {
      const allowedFields = [
        "phone",
        "location",
        "jobTitle",
        "companyName",
        "department",
        "experience",
      ];

      const existing = getRecruiterProfile(user);
      const updated = { ...existing };

      for (const field of allowedFields) {
        if (Object.hasOwn(body, field)) {
          updated[field] = body[field];
        }
      }

      for (const field of allowedFields) {
        if (
          typeof updated[field] !== "string" ||
          updated[field].trim().length > 200
        ) {
          return NextResponse.json(
            { success: false, message: `Invalid ${field}` },
            { status: 400 },
          );
        }

        updated[field] = updated[field].trim();
      }

      if (updated.companyName.length > 150) {
        return NextResponse.json(
          { success: false, message: "Company name is too long" },
          { status: 400 },
        );
      }

      const recruiterData = {
        ...updated,
        recruiterName: user.fullName,
      };

      user.profile = {
        ...oldProfile,
        recruiter: recruiterData,
      };

      user.updatedAt = new Date();
      user.markModified("profile");

      await user.save();

      return NextResponse.json({
        success: true,
        message: "Recruiter profile updated successfully",
        profile: {
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified !== false,
          accountStatus: user.accountStatus || "active",
          ...recruiterData,
        },
      });
    }

    if (user.role === "student") {
      const allowedFields = [
        "phone",
        "location",
        "dob",
        "role",
        "currentRole",
        "careerGoal",
        "preferredLocation",
        "experienceLevel",
        "expectedRole",
        "skills",
        "education",
        "experiences",
        "projects",
        "portfolioLinks",
      ];

      const existing = getStudentProfile(user);
      const updated = { ...existing };

      for (const field of allowedFields) {
        if (Object.hasOwn(body, field)) {
          updated[field] = body[field];
        }
      }

      const textFields = [
        "phone",
        "location",
        "dob",
        "role",
        "currentRole",
        "careerGoal",
        "preferredLocation",
        "experienceLevel",
        "expectedRole",
      ];

      for (const field of textFields) {
        if (typeof updated[field] !== "string" && updated[field] !== null) {
          return NextResponse.json(
            { success: false, message: `Invalid ${field}` },
            { status: 400 },
          );
        }
      }

      const arrayFields = [
        "skills",
        "education",
        "experiences",
        "projects",
        "portfolioLinks",
      ];

      for (const field of arrayFields) {
        if (!Array.isArray(updated[field])) {
          return NextResponse.json(
            { success: false, message: `Invalid ${field} data` },
            { status: 400 },
          );
        }
      }

      if (updated.skills.length > 50) {
        return NextResponse.json(
          { success: false, message: "Maximum 50 skills allowed" },
          { status: 400 },
        );
      }

      if (updated.projects.length > 30) {
        return NextResponse.json(
          { success: false, message: "Maximum 30 projects allowed" },
          { status: 400 },
        );
      }

      if (updated.portfolioLinks.length > 30) {
        return NextResponse.json(
          { success: false, message: "Maximum 30 portfolio links allowed" },
          { status: 400 },
        );
      }

      const oldStudent = oldProfile.student || {};
      const oldMediaIds = getProjectMediaIds(oldStudent.projects || []);
      const newMediaIds = getProjectMediaIds(updated.projects || []);

      const removedMediaIds = [...oldMediaIds].filter(
        (publicId) => !newMediaIds.has(publicId),
      );

      user.profile = {
        ...oldProfile,
        student: updated,
      };

      user.updatedAt = new Date();
      user.markModified("profile");

      await user.save();

      const projectFolder = `resumeai/users/${user._id}/projects/`;

      await Promise.allSettled(
        removedMediaIds
          .filter((publicId) => publicId.startsWith(projectFolder))
          .map((publicId) =>
            cloudinary.uploader.destroy(publicId, {
              resource_type: "image",
            }),
          ),
      );

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        profile: {
          fullName: user.fullName,
          email: user.email,
          ...updated,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported account type" },
      { status: 403 },
    );
  } catch (error) {
    console.error("PATCH profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update profile",
      },
      { status: 500 },
    );
  }
}
