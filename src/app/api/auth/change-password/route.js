import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import User from "@/app/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const authenticatedUser = await getAuthenticatedUser();

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";

    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Enter both passwords." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be between 8 and 72 characters.",
        },
        { status: 400 },
      );
    }

    const user = await User.findById(authenticatedUser._id).select(
      "+passwordHash",
    );

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Unable to verify your account." },
        { status: 404 },
      );
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordMatches) {
      return NextResponse.json(
        { success: false, message: "Your current password is incorrect." },
        { status: 400 },
      );
    }

    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (samePassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your new password must be different from your current password.",
        },
        { status: 400 },
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to change password. Please try again.",
      },
      { status: 500 },
    );
  }
}
