/*
  Warnings:

  - A unique constraint covering the columns `[nationalIdCardId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tradeLicenseCardId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "nationalIdCardId" TEXT,
ADD COLUMN     "tradeLicenseCardId" TEXT;

-- CreateTable
CREATE TABLE "VerificationSubmission" (
    "id" TEXT NOT NULL,

    CONSTRAINT "VerificationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_nationalIdCardId_key" ON "FileInstance"("nationalIdCardId");

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_tradeLicenseCardId_key" ON "FileInstance"("tradeLicenseCardId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_nationalIdCardId_fkey" FOREIGN KEY ("nationalIdCardId") REFERENCES "VerificationSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_tradeLicenseCardId_fkey" FOREIGN KEY ("tradeLicenseCardId") REFERENCES "VerificationSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
