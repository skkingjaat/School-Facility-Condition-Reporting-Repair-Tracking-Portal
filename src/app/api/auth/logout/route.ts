// src/app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout",
      },
      { status: 500 }
    );
  }
}