/*
  Warnings:

  - You are about to drop the column `servicePRoviderRole` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "servicePRoviderRole" "ServicePRoviderRole",
ADD COLUMN     "yearOfExperience" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "servicePRoviderRole";
