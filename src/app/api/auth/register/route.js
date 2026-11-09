import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";

import { createOtp, hashOtp } from "@/lib/security";
import { validateRegistration } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/mailer";
import User from "@/app/models/User";
import PendingRegistration from "@/app/models/PendingRegistration";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error, field } = validateRegistration(body);
    if (error)
      return NextResponse.json({ message: error, field }, { status: 400 });

    await connectDB();

    const existingUser = await User.exists({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
          field: "email",
        },
        { status: 409 },
      );
    }

    const now = new Date();
    const oldPending = await PendingRegistration.findOne({ email: data.email })
      .select("+otpHash +passwordHash")
      .lean();

    if (oldPending && oldPending.resendAvailableAt > now) {
      return NextResponse.json(
        {
          message:
            "A verification code was recently sent. Check your email or wait before trying again.",
          retryAfterSeconds: Math.ceil(
            (oldPending.resendAvailableAt - now) / 1000,
          ),
        },
        { status: 429 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const code = createOtp();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const pendingData = {
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: data.role,

      // Store student data only inside profile.student.
      profile: data.profile,

      otpHash: hashOtp(data.email, code),
      expiresAt,
      attempts: 0,
      resendAvailableAt: new Date(now.getTime() + 30 * 1000),
      sendsWindowStartedAt: oldPending?.sendsWindowStartedAt || now,
      sendsInWindow: oldPending ? (oldPending.sendsInWindow || 1) + 1 : 1,
      createdAt: oldPending?.createdAt || now,
      updatedAt: now,
    };

    if (pendingData.sendsInWindow > 5) {
      return NextResponse.json(
        {
          message:
            "You have reached the verification email limit. Please try again later.",
          retryAfterSeconds: 3600,
        },
        { status: 429 },
      );
    }

    await PendingRegistration.findOneAndUpdate(
      { email: data.email },
      { $set: pendingData },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    try {
      await sendVerificationEmail(data.email, code, data.fullName);
    } catch (mailError) {
      // Remove only the pending record created/updated by this request.
      await PendingRegistration.deleteOne({
        email: data.email,
        otpHash: hashOtp(data.email, code),
      });
      console.error("Registration email delivery failed:", mailError);
      return NextResponse.json(
        {
          message:
            "We couldn't send the verification email. Please try again later.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent.",
        email: data.email,
        expiresInSeconds: 600,
        resendAfterSeconds: 30,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register API error:", error);
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          message:
            "An account or pending registration already exists for this email.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "Unable to complete registration right now." },
      { status: 500 },
    );
  }
}
