-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('HOLD', 'SUSPEND', 'ACTIVE');

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "status" "VenueStatus" NOT NULL DEFAULT 'ACTIVE';
