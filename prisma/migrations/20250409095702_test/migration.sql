/*
  Warnings:

  - The `servicePRoviderRole` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ServiceProviderRole" AS ENUM ('PHOTOGRAPHER', 'VIDEOGRAPHER', 'DJ_BAND', 'catering');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "servicePRoviderRole",
ADD COLUMN     "servicePRoviderRole" "ServiceProviderRole";

-- DropEnum
DROP TYPE "ServicePRoviderRole";
