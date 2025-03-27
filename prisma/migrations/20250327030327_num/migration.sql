/*
  Warnings:

  - Added the required column `type` to the `FileInstance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "type" "FileType" NOT NULL;
