import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { createIssueSchema } from "@/lib/validations/issue";

export async function POST(request: Request) {
  try {
    const auth = await requireRole("PARENT", "TEACHER");

    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();

    const result = createIssueSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      description,
      category,
      location,
      priority,
    } = result.data;

    const issue = await prisma.$transaction(async (tx) => {
      const createdIssue = await tx.issue.create({
        data: {
          description,
          category,
          location,
          priority,
          reportedBy: auth.session.userId,

          timeline: {
            create: {
              action: "ISSUE_REPORTED",
              description: "Issue was reported",
              createdBy: auth.session.userId,
            },
          },
        },
        include: {
          timeline: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: auth.session.userId,
          issueId: createdIssue.id,
          message: `Your facility issue ${createdIssue.id} has been reported successfully.`,
        },
      });

      return createdIssue;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Issue reported successfully",
        data: {
          issue,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create issue error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to report issue",
      },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  try {
    const auth = await requireRole("PARENT", "TEACHER", "ADMIN");

    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const requestedSchoolId = searchParams.get("schoolId");

    let schoolId: string | undefined;

    if (auth.session.role === "ADMIN") {
      schoolId = requestedSchoolId || auth.session.schoolId;

      if (requestedSchoolId) {
        const { hasAdminSchoolAccess } = await import(
          "@/lib/auth/admin-school"
        );

        const hasAccess = await hasAdminSchoolAccess(
          auth.session.userId,
          requestedSchoolId
        );

        if (!hasAccess) {
          return NextResponse.json(
            {
              success: false,
              message: "You do not have permission to access this school",
            },
            { status: 403 }
          );
        }
      }
    }

    const issues = await prisma.issue.findMany({
      where: {
        ...(auth.session.role === "ADMIN"
          ? {
            reporter: {
              schoolId,
            },
          }
          : auth.session.role === "TEACHER"
            ? {
              OR: [
                {
                  reportedBy: auth.session.userId,
                },
                {
                  repairTask: {
                    assignedTo: auth.session.userId,
                  },
                },
              ],
            }
            : {
              reportedBy: auth.session.userId,
            }),

        ...(status
          ? {
            status: status as
              | "PENDING"
              | "IN_PROGRESS"
              | "RESOLVED",
          }
          : {}),

        ...(priority
          ? {
            priority: priority as
              | "LOW"
              | "MEDIUM"
              | "HIGH"
              | "CRITICAL",
          }
          : {}),

        ...(category
          ? {
            category: category as
              | "FURNITURE"
              | "CLASSROOM"
              | "TOILET_SANITATION"
              | "ELECTRICAL"
              | "SAFETY"
              | "OTHER",
          }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        media: true,

        reporter: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },

        timeline: {
          orderBy: {
            createdAt: "asc",
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

    return NextResponse.json({
      success: true,
      message: "Issues retrieved successfully",
      data: {
        issues,
      },
    });
  } catch (error) {
    console.error("Get issues error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve issues",
      },
      { status: 500 }
    );
  }
}