import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import PendingRegistration from "@/app/models/PendingRegistration";
import { createOtp, hashOtp, normalizeEmail } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    await connectDB();
    const pending = await PendingRegistration.findOne({ email }).lean();
    if (!pending) {
      return NextResponse.json(
        {
          message: "No pending registration was found. Please register again.",
        },
        { status: 404 },
      );
    }

    const now = new Date();
    if (pending.resendAvailableAt && pending.resendAvailableAt > now) {
      return NextResponse.json(
        {
          message: "Please wait before requesting another code.",
          retryAfterSeconds: Math.ceil(
            (pending.resendAvailableAt - now) / 1000,
          ),
        },
        { status: 429 },
      );
    }

    const windowStart = pending.sendsWindowStartedAt || now;
    const withinWindow =
      now.getTime() - new Date(windowStart).getTime() < 60 * 60 * 1000;
    const sendsInWindow = withinWindow ? pending.sendsInWindow || 1 : 0;
    if (sendsInWindow >= 5) {
      return NextResponse.json(
        {
          message: "You have reached the resend limit. Please try again later.",
          retryAfterSeconds: 3600,
        },
        { status: 429 },
      );
    }

    const code = createOtp();
    const otpHash = hashOtp(email, code);
    const updated = await PendingRegistration.findOneAndUpdate(
      {
        _id: pending._id,
        $or: [
          { resendAvailableAt: { $lte: now } },
          { resendAvailableAt: { $exists: false } },
        ],
      },
      {
        $set: {
          otpHash,
          expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
          attempts: 0,
          resendAvailableAt: new Date(now.getTime() + 30 * 1000),
          sendsWindowStartedAt: withinWindow ? windowStart : now,
          sendsInWindow: sendsInWindow + 1,
          updatedAt: now,
        },
      },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        {
          message: "Please wait before requesting another code.",
          retryAfterSeconds: 30,
        },
        { status: 429 },
      );
    }

    try {
      await sendVerificationEmail(email, code, pending.fullName);
    } catch (mailError) {
      console.error("Resend email delivery failed:", mailError);
      return NextResponse.json(
        {
          message:
            "Unable to send a new code right now. Please try again later.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent.",
      resendAfterSeconds: 30,
    });
  } catch (error) {
    console.error("Resend OTP API error:", error);
    return NextResponse.json(
      { message: "Unable to resend the code right now." },
      { status: 500 },
    );
  }
}
