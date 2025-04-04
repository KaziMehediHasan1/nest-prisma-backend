/*
  Warnings:

  - A unique constraint covering the columns `[profileId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventPreferenceId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gender` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "eventPreferenceId" TEXT,
ADD COLUMN     "profileId" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "fileInstanceId" TEXT,
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "profileId" TEXT;

-- CreateTable
CREATE TABLE "EventPreference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileId" TEXT,

    CONSTRAINT "EventPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventPreference_name_key" ON "EventPreference"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_profileId_key" ON "FileInstance"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_eventPreferenceId_key" ON "FileInstance"("eventPreferenceId");

-- AddForeignKey
ALTER TABLE "EventPreference" ADD CONSTRAINT "EventPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_eventPreferenceId_fkey" FOREIGN KEY ("eventPreferenceId") REFERENCES "EventPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
