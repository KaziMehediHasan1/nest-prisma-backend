/*
  Warnings:

  - You are about to drop the column `profileId` on the `FileInstance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coverPhotoId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "FileInstance" DROP CONSTRAINT "FileInstance_profileId_fkey";

-- DropIndex
DROP INDEX "FileInstance_profileId_key";

-- AlterTable
ALTER TABLE "FileInstance" DROP COLUMN "profileId";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "coverPhotoId" TEXT,
ADD COLUMN     "imageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_imageId_key" ON "Profile"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_coverPhotoId_key" ON "Profile"("coverPhotoId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_coverPhotoId_fkey" FOREIGN KEY ("coverPhotoId") REFERENCES "FileInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
