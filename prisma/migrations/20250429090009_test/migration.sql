-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_bookedById_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_serviceProviderId_fkey";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
