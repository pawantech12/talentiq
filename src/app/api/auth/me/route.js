import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/mongoose";
import User from "@/app/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("resumeai_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 },
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET is missing or invalid.");
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );

    if (!payload.sub) {
      return NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findById(payload.sub).select(
      "fullName email role profile emailVerified accountStatus",
    );

    if (
      !user ||
      !user.emailVerified ||
      user.accountStatus !== "active" ||
      user.role !== payload.role ||
      user.email !== payload.email
    ) {
      const response = NextResponse.json(
        { success: false, message: "Session is no longer valid." },
        { status: 401 },
      );

      response.cookies.set("resumeai_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    if (
      error?.code === "ERR_JWT_EXPIRED" ||
      error?.code === "ERR_JWS_INVALID" ||
      error?.code === "ERR_JWT_CLAIM_VALIDATION_FAILED"
    ) {
      return NextResponse.json(
        { success: false, message: "Your session has expired." },
        { status: 401 },
      );
    }

    console.error("Get current user API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to retrieve your account." },
      { status: 500 },
    );
  }
}
