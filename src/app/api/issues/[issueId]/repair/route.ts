import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{
    issueId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireRole("ADMIN");

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

    const body = await request.json();

    const assignedTo =
      typeof body.assignedTo === "string"
        ? body.assignedTo.trim()
        : "";

    if (!assignedTo) {
      return NextResponse.json(
        {
          success: false,
          message: "Assigned user ID is required",
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
            schoolId: true,
          },
        },
        repairTask: true,
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

    if (issue.repairTask) {
      return NextResponse.json(
        {
          success: false,
          message: "A repair task is already assigned to this issue",
        },
        { status: 409 }
      );
    }

    const assignee = await prisma.user.findUnique({
      where: {
        id: assignedTo,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
      },
    });

    if (!assignee) {
      return NextResponse.json(
        {
          success: false,
          message: "Assigned user not found",
        },
        { status: 404 }
      );
    }

    if (assignee.schoolId !== auth.session.schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "Assigned user must belong to the same school",
        },
        { status: 403 }
      );
    }

    if (assignee.role !== "TEACHER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only teachers can be assigned repair tasks",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const repairTask = await tx.repairTask.create({
        data: {
          issueId,
          assignedTo: assignee.id,
          status: "ASSIGNED",
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              schoolId: true,
            },
          },
        },
      });

      await tx.issueTimeline.create({
        data: {
          issueId,
          action: "REPAIR_ASSIGNED",
          description: `Repair task assigned to ${assignee.name}`,
          createdBy: auth.session.userId,
        },
      });

      await tx.notification.create({
        data: {
          userId: assignee.id,
          issueId,
          message: `A repair task has been assigned to you for issue ${issueId}.`,
        },
      });

      return repairTask;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Repair task assigned successfully",
        data: {
          repairTask: result,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Assign repair task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to assign repair task",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireRole("ADMIN", "TEACHER");

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

    const body = await request.json();

    const requestedStatus =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (
      requestedStatus !== "IN_PROGRESS" &&
      requestedStatus !== "COMPLETED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status must be either IN_PROGRESS or COMPLETED",
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
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
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

    if (!issue.repairTask) {
      return NextResponse.json(
        {
          success: false,
          message: "No repair task is assigned to this issue",
        },
        { status: 404 }
      );
    }

    if (issue.repairTask.assignee.schoolId !== auth.session.schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "Repair task does not belong to your school",
        },
        { status: 403 }
      );
    }

    if (
      auth.session.role === "TEACHER" &&
      issue.repairTask.assignedTo !== auth.session.userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update repair tasks assigned to you",
        },
        { status: 403 }
      );
    }

    const currentStatus = issue.repairTask.status;

    if (
      currentStatus === "ASSIGNED" &&
      requestedStatus !== "IN_PROGRESS"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An assigned repair task must move to IN_PROGRESS before it can be completed",
        },
        { status: 400 }
      );
    }

    if (
      currentStatus === "IN_PROGRESS" &&
      requestedStatus !== "COMPLETED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An in-progress repair task can only move to COMPLETED",
        },
        { status: 400 }
      );
    }

    if (currentStatus === "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          message: "Completed repair tasks cannot be updated",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const repairTask = await tx.repairTask.update({
        where: {
          id: issue.repairTask!.id,
        },
        data: {
          status: requestedStatus as "IN_PROGRESS" | "COMPLETED",
          completedAt:
            requestedStatus === "COMPLETED" ? new Date() : null,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              schoolId: true,
            },
          },
        },
      });

      const issueStatus =
        requestedStatus === "IN_PROGRESS"
          ? "IN_PROGRESS"
          : "RESOLVED";

      await tx.issue.update({
        where: {
          id: issueId,
        },
        data: {
          status: issueStatus,
        },
      });

      const action =
        requestedStatus === "IN_PROGRESS"
          ? "REPAIR_STARTED"
          : "REPAIR_COMPLETED";

      const description =
        requestedStatus === "IN_PROGRESS"
          ? `Repair work started by ${issue.repairTask!.assignee.name}`
          : `Repair work completed by ${issue.repairTask!.assignee.name}`;

      await tx.issueTimeline.create({
        data: {
          issueId,
          action,
          description,
          createdBy: auth.session.userId,
        },
      });

      const notificationMessage =
    requestedStatus === "IN_PROGRESS"
        ? `Repair work has started for issue ${issueId}.`
        : `Your facility issue ${issueId} has been resolved successfully.`;

      await tx.notification.create({
        data: {
          userId: issue.reportedBy,
          issueId,
          message: notificationMessage,
        },
      });

      if (issue.repairTask!.assignedTo !== issue.reporter.id) {
        await tx.notification.create({
          data: {
            userId: issue.repairTask!.assignedTo,
            issueId,
            message: notificationMessage,
          },
        });
      }

      return {
        repairTask,
        issueStatus,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message:
          requestedStatus === "IN_PROGRESS"
            ? "Repair work started successfully"
            : "Repair work completed successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update repair status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update repair status",
      },
      { status: 500 }
    );
  }
}