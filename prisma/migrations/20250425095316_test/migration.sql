/*
  Warnings:

  - Added the required column `bio` to the `VerificationSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationSubmission" ADD COLUMN     "bio" TEXT NOT NULL;
