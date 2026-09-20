import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

export async function POST(request: Request) {
  try {
    const auth = await requireRole("ADMIN");

    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();

    const issueId =
      typeof body.issueId === "string"
        ? body.issueId.trim()
        : "";

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
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            schoolId: true,
          },
        },
        repairTask: {
          select: {
            assignedTo: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                schoolId: true,
              },
            },
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

    if (issue.reporter.schoolId !== auth.session.schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to manage this issue",
        },
        { status: 403 }
      );
    }

    if (issue.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Only pending issues can receive repair reminders",
        },
        { status: 400 }
      );
    }

    if (!issue.repairTask) {
      return NextResponse.json(
        {
          success: false,
          message: "No repair task is assigned to this issue",
        },
        { status: 404 }
      );
    }

    if (issue.repairTask.status !== "ASSIGNED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Repair reminders can only be sent for assigned pending repairs",
        },
        { status: 400 }
      );
    }

    if (
      issue.repairTask.assignee.schoolId !==
      auth.session.schoolId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Assigned repair staff must belong to the same school",
        },
        { status: 403 }
      );
    }

    const message = `Reminder: Repair for issue ${issueId} is still pending.`;

    const notifications = await prisma.$transaction([
      prisma.notification.create({
        data: {
          userId: issue.reporter.id,
          issueId,
          message,
        },
      }),

      prisma.notification.create({
        data: {
          userId: issue.repairTask.assignedTo,
          issueId,
          message,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Pending repair reminder sent successfully",
        data: {
          notifications,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send pending repair reminder error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send pending repair reminder",
      },
      { status: 500 }
    );
  }
}