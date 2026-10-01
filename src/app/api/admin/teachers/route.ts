import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { hasAdminSchoolAccess } from "@/lib/auth/admin-school";

export async function GET(request: Request) {
  try {
    const auth = await requireRole("ADMIN");

    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const requestedSchoolId = searchParams.get("schoolId");

    const schoolId = requestedSchoolId || auth.session.schoolId;

    if (requestedSchoolId) {
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

    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: "TEACHER",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Teachers retrieved successfully",
      data: {
        teachers,
      },
    });
  } catch (error) {
    console.error("Get admin teachers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve teachers",
      },
      { status: 500 }
    );
  }
}