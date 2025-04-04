/*
  Warnings:

  - You are about to drop the column `profileId` on the `EventPreference` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventPreference" DROP CONSTRAINT "EventPreference_profileId_fkey";

-- AlterTable
ALTER TABLE "EventPreference" DROP COLUMN "profileId";

-- CreateTable
CREATE TABLE "_EventPreferenceToProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventPreferenceToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventPreferenceToProfile_B_index" ON "_EventPreferenceToProfile"("B");

-- AddForeignKey
ALTER TABLE "_EventPreferenceToProfile" ADD CONSTRAINT "_EventPreferenceToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "EventPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventPreferenceToProfile" ADD CONSTRAINT "_EventPreferenceToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
