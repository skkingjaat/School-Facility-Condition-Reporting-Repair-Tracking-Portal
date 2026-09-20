import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/session";

export type UserRole = "PARENT" | "TEACHER" | "ADMIN";

export type AuthorizedSession = {
  userId: string;
  role: UserRole;
  schoolId: string;
};

export async function requireAuth() {
  const session = await getAuthSession();

  if (!session) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      role: true,
      schoolId: true,
    },
  });

  if (!user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "User account not found",
        },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true as const,
    session: {
      userId: user.id,
      role: user.role as UserRole,
      schoolId: user.schoolId,
    },
  };
}

export async function requireRole(...allowedRoles: UserRole[]) {
  const auth = await requireAuth();

  if (!auth.authorized) {
    return auth;
  }

  if (!allowedRoles.includes(auth.session.role)) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "You do not have permission to perform this action",
        },
        { status: 403 }
      ),
    };
  }

  return auth;
}