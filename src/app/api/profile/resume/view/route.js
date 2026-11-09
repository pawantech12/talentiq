import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/profile-auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resume = user.profile?.student?.resume;

    if (!resume?.publicId) {
      return NextResponse.json(
        { message: "No resume uploaded" },
        { status: 404 },
      );
    }

    // Generate a signed Cloudinary URL.
    const signedUrl = cloudinary.url(resume.publicId, {
      resource_type: "raw",
      type: "upload",
      secure: true,
      sign_url: true,
    });

    // Forward PDF range requests from the browser.
    const range = request.headers.get("range");

    const upstream = await fetch(signedUrl, {
      method: "GET",
      headers: range ? { Range: range } : {},
      cache: "no-store",
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error("Cloudinary PDF delivery failed:", {
        status: upstream.status,
        statusText: upstream.statusText,
        publicId: resume.publicId,
      });

      return NextResponse.json(
        { message: "Unable to retrieve the resume PDF from storage." },
        { status: 502 },
      );
    }

    const headers = new Headers();

    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", 'inline; filename="resume.pdf"');
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    // Preserve range-related headers for PDF viewers.
    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");
    const contentLength = upstream.headers.get("content-length");

    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    if (acceptRanges) {
      headers.set("Accept-Ranges", acceptRanges);
    }

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("Resume PDF preview:", error);

    return NextResponse.json(
      { message: "Unable to display resume" },
      { status: 500 },
    );
  }
}
