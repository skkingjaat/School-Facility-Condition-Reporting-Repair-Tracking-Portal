import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/authorization";
import { getAdminSchools } from "@/lib/auth/admin-school";

export async function GET() {
  try {
    const auth = await requireRole("ADMIN");

    if (!auth.authorized) {
      return auth.response;
    }

    const accessRecords = await getAdminSchools(auth.session.userId);

    const schools = accessRecords.map((record) => ({
      id: record.school.id,
    }));

    return NextResponse.json({
      success: true,
      message: "Authorized schools retrieved successfully",
      data: {
        schools,
        currentSchoolId: auth.session.schoolId,
      },
    });
  } catch (error) {
    console.error("Get admin schools error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve authorized schools",
      },
      { status: 500 }
    );
  }
}