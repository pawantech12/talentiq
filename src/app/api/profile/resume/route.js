import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getAuthenticatedUser } from "@/lib/profile-auth";

export const runtime = "nodejs";

export async function PATCH(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { file } = await request.json();

    if (!file?.publicId || !file?.originalName || !file?.secureUrl) {
      return NextResponse.json(
        { message: "Invalid resume metadata" },
        { status: 400 },
      );
    }

    const profile = user.profile?.toObject?.() || user.profile || {};
    const student = profile.student || {};

    const previousResume = student.resume;

    user.profile = {
      ...profile,
      student: {
        ...student,
        resume: {
          ...file,
          uploadedAt: new Date(),
        },
      },
    };

    await user.save();

    // Remove the old Cloudinary asset after the new one is saved.
    if (previousResume?.publicId && previousResume.publicId !== file.publicId) {
      try {
        await cloudinary.uploader.destroy(previousResume.publicId, {
          resource_type: "raw",
        });
      } catch (error) {
        console.error("Old resume cleanup failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Resume saved successfully",
      resume: user.profile.student.resume,
    });
  } catch (error) {
    console.error("Resume save:", error);

    return NextResponse.json(
      { message: "Unable to save resume" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const profile = user.profile?.toObject?.() || user.profile || {};
    const student = profile.student || {};
    const resume = student.resume;

    if (resume?.publicId) {
      await cloudinary.uploader.destroy(resume.publicId, {
        resource_type: "raw",
      });
    }

    user.profile = {
      ...profile,
      student: {
        ...student,
        resume: null,
      },
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Resume delete:", error);

    return NextResponse.json(
      { message: "Unable to delete resume" },
      { status: 500 },
    );
  }
}
