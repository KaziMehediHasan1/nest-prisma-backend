-- CreateTable
CREATE TABLE "_ProfileToServiceProviderType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileToServiceProviderType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProfileToServiceProviderType_B_index" ON "_ProfileToServiceProviderType"("B");

-- AddForeignKey
ALTER TABLE "_ProfileToServiceProviderType" ADD CONSTRAINT "_ProfileToServiceProviderType_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToServiceProviderType" ADD CONSTRAINT "_ProfileToServiceProviderType_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceProviderType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
