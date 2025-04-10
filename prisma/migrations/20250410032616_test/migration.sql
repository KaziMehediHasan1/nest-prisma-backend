-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'BACHELOR_PARTY', 'ANNIVERSARY', 'OTHERS');

-- AlterTable
ALTER TABLE "Amenities" ADD COLUMN     "default" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "profileId" TEXT,
    "booking" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "venueId" TEXT,
    "guestNumber" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL DEFAULT 'OTHERS',

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
