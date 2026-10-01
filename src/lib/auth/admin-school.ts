import { prisma } from "@/lib/prisma";

export async function hasAdminSchoolAccess(
  adminId: string,
  schoolId: string
): Promise<boolean> {
  const access = await prisma.adminSchoolAccess.findUnique({
    where: {
      adminId_schoolId: {
        adminId,
        schoolId,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(access);
}

export async function getAdminSchools(adminId: string) {
  return prisma.adminSchoolAccess.findMany({
    where: {
      adminId,
    },
    select: {
      school: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      schoolId: "asc",
    },
  });
}