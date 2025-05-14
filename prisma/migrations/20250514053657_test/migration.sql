-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "worksId" TEXT;

-- CreateTable
CREATE TABLE "Works" (
    "id" TEXT NOT NULL,
    "eventTypeId" TEXT,
    "projectTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profileId" TEXT,

    CONSTRAINT "Works_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Works" ADD CONSTRAINT "Works_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Works" ADD CONSTRAINT "Works_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_worksId_fkey" FOREIGN KEY ("worksId") REFERENCES "Works"("id") ON DELETE SET NULL ON UPDATE CASCADE;
