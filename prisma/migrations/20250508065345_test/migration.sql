-- AlterTable
ALTER TABLE "Amenities" ADD COLUMN     "profileId" TEXT;

-- AddForeignKey
ALTER TABLE "Amenities" ADD CONSTRAINT "Amenities_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
