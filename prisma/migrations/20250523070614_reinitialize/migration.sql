-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "serviceProviderTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_serviceProviderTypeId_fkey" FOREIGN KEY ("serviceProviderTypeId") REFERENCES "ServiceProviderType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
