/*
  Warnings:

  - You are about to drop the column `serviceProviderRole` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceProviderTypeId]` on the table `FileInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "serviceProviderTypeId" TEXT;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "serviceProviderRole";

-- DropEnum
DROP TYPE "ServiceProviderRole";

-- CreateTable
CREATE TABLE "ServiceProviderType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ServiceProviderType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_serviceProviderTypeId_key" ON "FileInstance"("serviceProviderTypeId");

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_serviceProviderTypeId_fkey" FOREIGN KEY ("serviceProviderTypeId") REFERENCES "ServiceProviderType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
