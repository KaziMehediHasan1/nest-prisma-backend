-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableNotification" BOOLEAN NOT NULL DEFAULT true;
