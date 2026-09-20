import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

export async function GET() {
    try {
        const auth = await requireRole("ADMIN");

        if (!auth.authorized) {
            return auth.response;
        }

        const teachers = await prisma.user.findMany({
            where: {
                schoolId: auth.session.schoolId,
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