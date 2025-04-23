-- CreateTable
CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "magicLinkId" TEXT NOT NULL,
    "bookingId" TEXT,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_profileId_key" ON "MagicLink"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_magicLinkId_key" ON "MagicLink"("magicLinkId");

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
