import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const schools = await prisma.school.findMany({
            select: {
                id: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                schools,
            },
        });
    } catch (error) {
        console.error("Schools fetch error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load schools",
            },
            { status: 500 }
        );
    }
}