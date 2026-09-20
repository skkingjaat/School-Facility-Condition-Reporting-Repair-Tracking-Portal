import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authenticated user retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get authenticated user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve authenticated user",
      },
      { status: 500 }
    );
  }
}