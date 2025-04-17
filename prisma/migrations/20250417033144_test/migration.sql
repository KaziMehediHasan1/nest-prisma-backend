-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_coverPhotoId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_imageId_fkey";

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_coverPhotoId_fkey" FOREIGN KEY ("coverPhotoId") REFERENCES "FileInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
