import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setAuthCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = registerSchema.safeParse(body);

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

        const { name, email, password, role, schoolId } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "An account with this email already exists",
                },
                { status: 409 }
            );
        }

        const school = await prisma.school.findUnique({
            where: {
                id: schoolId,
            },
            select: {
                id: true,
            },
        });

        if (!school) {
            return NextResponse.json(
                {
                    success: false,
                    message: "The selected school is not registered",
                },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                schoolId: school.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                schoolId: true,
                createdAt: true,
            },
        });

        await setAuthCookie({
            userId: user.id,
            role: user.role,
            schoolId: user.schoolId,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Registration successful",
                data: {
                    user,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to complete registration",
            },
            { status: 500 }
        );
    }
}