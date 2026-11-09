import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import cloudinary from "@/lib/cloudinary";
import { getAuthenticatedUser } from "@/lib/profile-auth";

export const runtime = "nodejs";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MAX_PROJECT_MEDIA_SIZE = 10 * 1024 * 1024;

const resumeTypes = new Set(["application/pdf"]);

const mediaTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function uploadToCloudinary(buffer, folder, resourceType) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: randomUUID(),
        overwrite: false,
        use_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned an empty response."));
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { message: "Student account required" },
        { status: 403 },
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      return NextResponse.json(
        { message: "Upload must use multipart/form-data." },
        { status: 400 },
      );
    }

    let formData;

    try {
      formData = await request.formData();
    } catch (error) {
      console.error("Multipart form parsing failed:", error);

      return NextResponse.json(
        { message: "Invalid file upload request." },
        { status: 400 },
      );
    }

    const file = formData.get("file");
    const kind = formData.get("kind");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please select a file" },
        { status: 400 },
      );
    }

    if (kind !== "resume" && kind !== "project-media") {
      return NextResponse.json(
        { message: "Invalid upload type" },
        { status: 400 },
      );
    }

    if (kind === "resume") {
      if (file.size > MAX_RESUME_SIZE) {
        return NextResponse.json(
          { message: "Resume must be smaller than 5 MB" },
          { status: 400 },
        );
      }

      if (!resumeTypes.has(file.type)) {
        return NextResponse.json(
          { message: "Only PDF resumes are allowed" },
          { status: 400 },
        );
      }
    }

    if (kind === "project-media") {
      if (file.size > MAX_PROJECT_MEDIA_SIZE) {
        return NextResponse.json(
          { message: "Project media must be smaller than 10 MB" },
          { status: 400 },
        );
      }

      if (!mediaTypes.has(file.type)) {
        return NextResponse.json(
          { message: "Only JPG, PNG and WEBP images are allowed" },
          { status: 400 },
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Check file signatures instead of trusting only the browser MIME type.
    const isPdf = buffer.subarray(0, 5).toString() === "%PDF-";

    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;

    const isPng = buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

    const isWebp =
      buffer.subarray(0, 4).toString() === "RIFF" &&
      buffer.subarray(8, 12).toString() === "WEBP";

    if (
      (kind === "resume" && !isPdf) ||
      (kind === "project-media" && !(isJpeg || isPng || isWebp))
    ) {
      return NextResponse.json(
        { message: "The file contents do not match the allowed file type" },
        { status: 400 },
      );
    }

    const folder =
      kind === "resume"
        ? `resumeai/users/${user._id}/resumes`
        : `resumeai/users/${user._id}/projects`;

    const resourceType = kind === "resume" ? "raw" : "image";

    let result;

    try {
      result = await uploadToCloudinary(buffer, folder, resourceType);
    } catch (cloudinaryError) {
      const headers = cloudinaryError?.response?.headers;

      const cloudinaryReason =
        headers?.get?.("x-cld-error") ||
        headers?.["x-cld-error"] ||
        cloudinaryError?.error?.message ||
        cloudinaryError?.error ||
        null;

      console.error("Cloudinary upload failed:", {
        message: cloudinaryError?.message,
        name: cloudinaryError?.name,
        http_code: cloudinaryError?.http_code,
        cloudinaryReason,
        errorProperties: Object.getOwnPropertyNames(cloudinaryError || {}),
      });

      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary rejected the file upload.",
          ...(process.env.NODE_ENV === "development"
            ? {
                details: cloudinaryError?.message,
                cloudinaryReason,
              }
            : {}),
        },
        { status: 502 },
      );
    }

    const uploadedFile = {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      originalName: file.name,
      format: result.format,
      bytes: result.bytes,
      resourceType,
      uploadedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: uploadedFile,
    });
  } catch (error) {
    console.error("Profile upload:", error);

    return NextResponse.json(
      { message: "File upload failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { publicId } = await request.json();

    if (
      typeof publicId !== "string" ||
      !publicId.startsWith(`resumeai/users/${user._id}/projects/`)
    ) {
      return NextResponse.json(
        { message: "Invalid project image" },
        { status: 400 },
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (!["ok", "not found"].includes(result.result)) {
      return NextResponse.json(
        { message: "Unable to delete image" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project image deleted",
    });
  } catch (error) {
    console.error("Project image deletion:", error);

    return NextResponse.json(
      { message: "Unable to delete project image" },
      { status: 500 },
    );
  }
}
