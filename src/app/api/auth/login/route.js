import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongoose";
import { normalizeEmail } from "@/lib/security";
import { createSessionToken } from "@/lib/session";
import User from "@/app/models/User";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";
    const role =
      typeof body?.role === "string" ? body.role.toLowerCase().trim() : "";
    const rememberMe = body?.rememberMe === true;

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length === 0 ||
      !["student", "recruiter"].includes(role)
    ) {
      return NextResponse.json(
        { message: "Please enter valid login details." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+passwordHash");

    // Use a generic message so the API does not reveal whether an email exists.
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        {
          message: `This account is registered as a ${user.role}. Please select the correct account type.`,
          field: "role",
        },
        { status: 403 },
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email address before logging in.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 },
      );
    }

    if (user.accountStatus !== "active") {
      return NextResponse.json(
        {
          message:
            "Your account is currently disabled. Please contact support.",
        },
        { status: 403 },
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });

    response.cookies.set("resumeai_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { message: "Unable to log in right now. Please try again." },
      { status: 500 },
    );
  }
}
