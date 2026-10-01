import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{
    issueId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireRole("PARENT", "TEACHER", "ADMIN");

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

      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            schoolId: true,
          },
        },

        media: {
          orderBy: {
            createdAt: "asc",
          },
        },

        timeline: {
          orderBy: {
            createdAt: "asc",
          },

          include: {
            actor: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },

        repairTask: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                role: true,
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

    /*
     * Parent/Teacher:
     * Can only view issues they personally reported.
     *
     * Admin:
     * Can view issues belonging to their school.
     */
    if (auth.session.role !== "ADMIN") {
      const isReporter = issue.reportedBy === auth.session.userId;
      const isAssignedTeacher =
        auth.session.role === "TEACHER" &&
        issue.repairTask?.assignedTo === auth.session.userId;

      if (!isReporter && !isAssignedTeacher) {
        return NextResponse.json(
          {
            success: false,
            message: "You do not have permission to view this issue",
          },
          { status: 403 }
        );
      }
    } else if (issue.reporter.schoolId !== auth.session.schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to view this issue",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Issue retrieved successfully",
      data: {
        issue,
      },
    });
  } catch (error) {
    console.error("Get issue error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve issue",
      },
      { status: 500 }
    );
  }
}