// src/app/api/dashboard/route.ts

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

export async function GET() {
  try {
    const auth = await requireRole("PARENT", "TEACHER", "ADMIN");

    if (!auth.authorized) {
      return auth.response;
    }

    const issueWhere =
  auth.session.role === "ADMIN"
    ? {
        reporter: {
          schoolId: auth.session.schoolId,
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
        };

    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      categoryCounts,
      priorityCounts,
      resolvedIssuesWithCompletion,
    ] = await Promise.all([
      prisma.issue.count({
        where: issueWhere,
      }),

      prisma.issue.count({
        where: {
          ...issueWhere,
          status: "PENDING",
        },
      }),

      prisma.issue.count({
        where: {
          ...issueWhere,
          status: "IN_PROGRESS",
        },
      }),

      prisma.issue.count({
        where: {
          ...issueWhere,
          status: "RESOLVED",
        },
      }),

      prisma.issue.groupBy({
        by: ["category"],
        where: issueWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.issue.groupBy({
        by: ["priority"],
        where: issueWhere,
        _count: {
          _all: true,
        },
      }),

      prisma.issue.findMany({
        where: {
          ...issueWhere,
          status: "RESOLVED",
          repairTask: {
            completedAt: {
              not: null,
            },
          },
        },
        select: {
          createdAt: true,
          repairTask: {
            select: {
              completedAt: true,
            },
          },
        },
      }),
    ]);

    const resolvedPercentage =
      totalIssues === 0
        ? 0
        : Number(((resolvedIssues / totalIssues) * 100).toFixed(2));

    /*
     * Average resolution time
     *
     * Calculation:
     * Issue reported time -> Repair completed time
     *
     * Only resolved issues with a real completedAt timestamp
     * are included in the calculation.
     */
    let averageResolutionTimeHours: number | null = null;

    if (resolvedIssuesWithCompletion.length > 0) {
      const totalResolutionTimeMilliseconds =
        resolvedIssuesWithCompletion.reduce((total, issue) => {
          const completedAt = issue.repairTask?.completedAt;

          if (!completedAt) {
            return total;
          }

          return total + (completedAt.getTime() - issue.createdAt.getTime());
        }, 0);

      const averageResolutionTimeMilliseconds =
        totalResolutionTimeMilliseconds /
        resolvedIssuesWithCompletion.length;

      averageResolutionTimeHours = Number(
        (
          averageResolutionTimeMilliseconds /
          (1000 * 60 * 60)
        ).toFixed(2)
      );
    }

    /*
     * User engagement rate
     *
     * Definition:
     * Unique users who have reported at least one issue
     * divided by registered users in the same school.
     *
     * This KPI is calculated for administrators because they
     * have school-wide visibility. Parent/teacher dashboards
     * continue to remain limited to their own issues.
     */
    let userEngagementRate: number | null = null;

    if (auth.session.role === "ADMIN") {
      const [registeredUsers, activeReporters] = await Promise.all([
        prisma.user.count({
          where: {
            schoolId: auth.session.schoolId,
            role: {
              in: ["PARENT", "TEACHER"],
            },
          },
        }),

        prisma.issue.findMany({
          where: {
            reporter: {
              schoolId: auth.session.schoolId,
              role: {
                in: ["PARENT", "TEACHER"],
              },
            },
          },
          select: {
            reportedBy: true,
          },
          distinct: ["reportedBy"],
        }),
      ]);

      userEngagementRate =
        registeredUsers === 0
          ? 0
          : Number(
              (
                (activeReporters.length / registeredUsers) *
                100
              ).toFixed(2)
            );
    }

    return NextResponse.json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        summary: {
          totalIssues,
          pendingIssues,
          inProgressIssues,
          resolvedIssues,
          resolvedPercentage,
          averageResolutionTimeHours,
          userEngagementRate,
        },

        categories: categoryCounts.map((item) => ({
          category: item.category,
          count: item._count._all,
        })),

        priorities: priorityCounts.map((item) => ({
          priority: item.priority,
          count: item._count._all,
        })),
      },
    });
  } catch (error) {
    console.error("Get dashboard data error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve dashboard data",
      },
      { status: 500 }
    );
  }
}