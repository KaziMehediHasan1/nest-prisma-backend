/*
  Warnings:

  - A unique constraint covering the columns `[verificationSubmissionId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "verificationSubmissionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_verificationSubmissionId_key" ON "Profile"("verificationSubmissionId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_verificationSubmissionId_fkey" FOREIGN KEY ("verificationSubmissionId") REFERENCES "VerificationSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
