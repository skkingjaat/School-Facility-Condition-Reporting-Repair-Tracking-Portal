import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/authorization";

export async function GET() {
  try {
    const auth = await requireAuth();

    if (!auth.authorized) {
      return auth.response;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: auth.session.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        issue: {
          select: {
            id: true,
            description: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve notifications",
      },
      { status: 500 }
    );
  }
}