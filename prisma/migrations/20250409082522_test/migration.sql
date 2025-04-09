-- CreateEnum
CREATE TYPE "ServicePRoviderRole" AS ENUM ('PHOTOGRAPHER', 'VIDEOGRAPHER', 'DJ_BAND', 'catering');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "servicePRoviderRole" "ServicePRoviderRole";
