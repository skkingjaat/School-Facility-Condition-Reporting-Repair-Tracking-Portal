-- CreateTable
CREATE TABLE "AdminSchoolAccess" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSchoolAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminSchoolAccess_adminId_idx" ON "AdminSchoolAccess"("adminId");

-- CreateIndex
CREATE INDEX "AdminSchoolAccess_schoolId_idx" ON "AdminSchoolAccess"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSchoolAccess_adminId_schoolId_key" ON "AdminSchoolAccess"("adminId", "schoolId");

-- AddForeignKey
ALTER TABLE "AdminSchoolAccess" ADD CONSTRAINT "AdminSchoolAccess_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSchoolAccess" ADD CONSTRAINT "AdminSchoolAccess_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
