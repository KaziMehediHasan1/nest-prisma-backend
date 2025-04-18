/*
  Warnings:

  - The values [DENIED] on the enum `AcceptanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bookingId` on the `EventType` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AcceptanceStatus_new" AS ENUM ('ACCEPTED', 'DENIEDx');
ALTER TABLE "Booking" ALTER COLUMN "accept" TYPE "AcceptanceStatus_new" USING ("accept"::text::"AcceptanceStatus_new");
ALTER TYPE "AcceptanceStatus" RENAME TO "AcceptanceStatus_old";
ALTER TYPE "AcceptanceStatus_new" RENAME TO "AcceptanceStatus";
DROP TYPE "AcceptanceStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "EventType" DROP CONSTRAINT "EventType_bookingId_fkey";

-- DropIndex
DROP INDEX "EventType_bookingId_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "eventTypeId" TEXT;

-- AlterTable
ALTER TABLE "EventType" DROP COLUMN "bookingId";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
