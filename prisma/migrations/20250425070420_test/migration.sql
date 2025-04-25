/*
  Warnings:

  - A unique constraint covering the columns `[verificationSubmissionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "verificationSubmissionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_verificationSubmissionId_key" ON "Payment"("verificationSubmissionId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_verificationSubmissionId_fkey" FOREIGN KEY ("verificationSubmissionId") REFERENCES "VerificationSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
