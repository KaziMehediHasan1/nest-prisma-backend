/*
  Warnings:

  - You are about to drop the column `fileType` on the `FileInstance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FileInstance" DROP COLUMN "fileType";

-- DropEnum
DROP TYPE "FileType";
