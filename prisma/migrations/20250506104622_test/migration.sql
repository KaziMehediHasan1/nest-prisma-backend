/*
  Warnings:

  - A unique constraint covering the columns `[venueDecorationId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "venueDecorationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_venueDecorationId_key" ON "FileInstance"("venueDecorationId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_venueDecorationId_fkey" FOREIGN KEY ("venueDecorationId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
