import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import User from "@/app/models/User";
import { connectDB } from "@/lib/mongoose";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();

    // Must match the cookie name used by your login route.
    const token = cookieStore.get("resumeai_session")?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    // createSessionToken stores the ID in `sub`, not `userId`.
    // userId is retained here as a fallback for older token formats.
    const userId = payload.sub || payload.userId;

    if (!userId) {
      return null;
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    // Only explicitly unverified or disabled accounts are rejected.
    // This also supports older records created before these fields existed.
    if (user.emailVerified === false) {
      return null;
    }

    if (user.accountStatus === "disabled") {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Profile authentication error:", error.message);
    return null;
  }
}
