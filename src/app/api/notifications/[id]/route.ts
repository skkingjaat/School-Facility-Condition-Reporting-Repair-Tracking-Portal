import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireAuth();

    if (!auth.authorized) {
      return auth.response;
    }

    const { id: notificationId } = await context.params;

    if (!notificationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required",
        },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
        },
        { status: 404 }
      );
    }

    if (notification.userId !== auth.session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to update this notification",
        },
        { status: 403 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
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
      message: "Notification marked as read",
      data: {
        notification: updatedNotification,
      },
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update notification",
      },
      { status: 500 }
    );
  }
}