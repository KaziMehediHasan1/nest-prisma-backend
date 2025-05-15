-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_venueId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "venueId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
