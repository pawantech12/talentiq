import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/app/models/User";
import PendingRegistration from "@/app/models/PendingRegistration";
import { hashOtp, normalizeEmail, safeEqualHex } from "@/lib/security";
import { createSessionToken } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request) {
  let requestEmail = "";
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);
    requestEmail = email;
    const code = String(body?.code || "");

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\d{6}$/.test(code)
    ) {
      return NextResponse.json(
        {
          message:
            "Enter your email address and the 6-digit verification code.",
        },
        { status: 400 },
      );
    }

    await connectDB();
    const pending = await PendingRegistration.findOne({ email }).select(
      "+otpHash +passwordHash",
    );

    if (!pending) {
      return NextResponse.json(
        {
          message:
            "This verification request has expired. Please register again.",
        },
        { status: 410 },
      );
    }

    const now = new Date();
    if (pending.expiresAt <= now) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      return NextResponse.json(
        {
          message: "Your verification code has expired. Please register again.",
        },
        { status: 410 },
      );
    }

    if (pending.attempts >= 5) {
      return NextResponse.json(
        {
          message:
            "Too many incorrect attempts. Request a new verification code.",
        },
        { status: 429 },
      );
    }

    const submittedHash = hashOtp(email, code);
    if (!safeEqualHex(submittedHash, pending.otpHash)) {
      await PendingRegistration.updateOne(
        { _id: pending._id, attempts: { $lt: 5 } },
        { $inc: { attempts: 1 }, $set: { updatedAt: now } },
      );
      const remaining = Math.max(0, 4 - pending.attempts);
      return NextResponse.json(
        {
          message: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
        },
        { status: 400 },
      );
    }

    // Unique User.email index prevents duplicate account creation if two requests race.
    const user = await User.create({
      fullName: pending.fullName,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role: pending.role,
      profile: pending.profile || {},
      emailVerified: true,
      accountStatus: "active",
      createdAt: now,
      updatedAt: now,
    });

    const token = await createSessionToken(user);
    await PendingRegistration.deleteOne({ _id: pending._id });

    const response = NextResponse.json({
      success: true,
      message: "Email verified and account created.",
      role: user.role,
    });

    response.cookies.set("resumeai_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Verify email API error:", error);
    if (error?.code === 11000) {
      await PendingRegistration.deleteOne({ email: requestEmail });
      return NextResponse.json(
        {
          message: "An account with this email already exists. Please log in.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "Unable to verify your email right now." },
      { status: 500 },
    );
  }
}
