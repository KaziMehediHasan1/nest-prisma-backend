/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_name_key" ON "Profile"("name");
