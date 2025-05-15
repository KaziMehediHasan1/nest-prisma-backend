/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ServiceProviderType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderType_name_key" ON "ServiceProviderType"("name");
