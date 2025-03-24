/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `FileInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "fileId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_fileId_key" ON "FileInstance"("fileId");
