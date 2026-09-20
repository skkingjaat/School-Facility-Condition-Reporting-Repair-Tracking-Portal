// File: src/app/api/issues/[issueId]/media/route.ts

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { cloudinary } from "@/lib/cloudinary";

type RouteContext = {
  params: Promise<{
    issueId: string;
  }>;
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

function uploadToCloudinary(
  buffer: Buffer,
  resourceType: "image" | "video",
  issueId: string
): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: `school-facility-portal/issues/${issueId}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary upload returned an invalid result"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireRole("PARENT", "TEACHER");

    if (!auth.authorized) {
      return auth.response;
    }

    const { issueId } = await context.params;

    if (!issueId) {
      return NextResponse.json(
        {
          success: false,
          message: "Issue ID is required",
        },
        { status: 400 }
      );
    }

    const issue = await prisma.issue.findUnique({
      where: {
        id: issueId,
      },
      select: {
        id: true,
        reportedBy: true,
        reporter: {
          select: {
            schoolId: true,
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json(
        {
          success: false,
          message: "Issue not found",
        },
        { status: 404 }
      );
    }

    if (issue.reportedBy !== auth.session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only upload media to your own issues",
        },
        { status: 403 }
      );
    }

    if (issue.reporter.schoolId !== auth.session.schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to upload media for this issue",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "A media file is required",
        },
        { status: 400 }
      );
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported file type. Only JPG, PNG, WEBP, MP4, WEBM, and MOV files are allowed",
        },
        { status: 400 }
      );
    }

    const maxSize = isImage
      ? MAX_IMAGE_SIZE
      : MAX_VIDEO_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: isImage
            ? "Image size must not exceed 10 MB"
            : "Video size must not exceed 50 MB",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is empty",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const mediaType = isImage ? "IMAGE" : "VIDEO";
    const resourceType = isImage ? "image" : "video";

    const uploadResult = await uploadToCloudinary(
      buffer,
      resourceType,
      issueId
    );

    const media = await prisma.issueMedia.create({
      data: {
        issueId,
        url: uploadResult.secure_url,
        type: mediaType,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Media uploaded successfully",
        data: {
          media,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload issue media error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to upload media",
      },
      { status: 500 }
    );
  }
}