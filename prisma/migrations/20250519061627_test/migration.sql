/*
  Warnings:

  - A unique constraint covering the columns `[profileId]` on the table `FcmToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FcmToken_profileId_key" ON "FcmToken"("profileId");
