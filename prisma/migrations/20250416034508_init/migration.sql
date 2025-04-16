-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PLANNER', 'SERVICE_PROVIDER', 'VENUE_OWNER', 'GUEST');

-- CreateEnum
CREATE TYPE "ServiceProviderRole" AS ENUM ('PHOTOGRAPHER', 'VIDEOGRAPHER', 'DJ_BAND', 'catering');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('ROUND', 'OVAL', 'HALF_MOON', 'BANQUET', 'SQUARE', 'HEXAGONAL');

-- CreateEnum
CREATE TYPE "SeatingStyle" AS ENUM ('BANQUET', 'THEATER', 'CLASSROOM', 'CABARET', 'U_SHAPED', 'COCKTAIL');

-- CreateEnum
CREATE TYPE "LightingStyle" AS ENUM ('AMBIENT', 'SPOTLIGHTING', 'FAIRY', 'CHANDELIERS', 'LED', 'NEON', 'GOBO');

-- CreateEnum
CREATE TYPE "FlowerColor" AS ENUM ('WHITE', 'RED', 'YELLOW', 'PINK', 'PURPLE', 'BLUE', 'GREEN', 'ORANGE');

-- CreateEnum
CREATE TYPE "FlowerType" AS ENUM ('ROSES', 'PEONIES', 'LILIES', 'ORCHIDS', 'TULIPS', 'SUNFLOWERS', 'HYDRANGEAS');

-- CreateEnum
CREATE TYPE "Fragrance" AS ENUM ('FLORAL_SCENTS', 'CITRUS_SCENTS', 'HERBAL_SCENTS', 'OCEANIC_SCENTS', 'WOODY_SCENTS', 'SPICY');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('INSTANT_BOOKING', 'REQUEST_BASED_BOOKING');

-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('HOTEL', 'RESTAURANT', 'CONFERENCE_HALL', 'BANQUET', 'RESORT', 'OUTDOOR');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'BACHELOR_PARTY', 'ANNIVERSARY', 'OTHERS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PLANNER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "imageId" TEXT,
    "coverPhotoId" TEXT,
    "fileInstanceId" TEXT,
    "servicePRoviderRole" "ServiceProviderRole",
    "yearOfExperience" INTEGER,
    "description" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPreference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EventPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" "VenueType" NOT NULL,
    "catering" TEXT,
    "parking" TEXT,
    "availability" TEXT,
    "extraServices" TEXT,
    "price" INTEGER NOT NULL,
    "bookingType" "BookingType" NOT NULL,
    "decorationId" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decoration" (
    "id" TEXT NOT NULL,
    "tableShapes" "TableShape"[],
    "seatingStyles" "SeatingStyle"[],
    "lighting" "LightingStyle"[],
    "flowerColors" "FlowerColor"[],
    "flowerTypes" "FlowerType"[],
    "fragrances" "Fragrance"[],

    CONSTRAINT "Decoration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venueId" TEXT,
    "default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileInstance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "bucket" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "venueId" TEXT,
    "eventPreferenceId" TEXT,

    CONSTRAINT "FileInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "profileId" TEXT,
    "booking" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "venueId" TEXT,
    "guestNumber" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL DEFAULT 'OTHERS',

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventPreferenceToProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventPreferenceToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_imageId_key" ON "Profile"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_coverPhotoId_key" ON "Profile"("coverPhotoId");

-- CreateIndex
CREATE UNIQUE INDEX "EventPreference_name_key" ON "EventPreference"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_decorationId_key" ON "Venue"("decorationId");

-- CreateIndex
CREATE UNIQUE INDEX "Amenities_name_key" ON "Amenities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_fileId_key" ON "FileInstance"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_venueId_key" ON "FileInstance"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "FileInstance_eventPreferenceId_key" ON "FileInstance"("eventPreferenceId");

-- CreateIndex
CREATE INDEX "_EventPreferenceToProfile_B_index" ON "_EventPreferenceToProfile"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_coverPhotoId_fkey" FOREIGN KEY ("coverPhotoId") REFERENCES "FileInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_decorationId_fkey" FOREIGN KEY ("decorationId") REFERENCES "Decoration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amenities" ADD CONSTRAINT "Amenities_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileInstance" ADD CONSTRAINT "FileInstance_eventPreferenceId_fkey" FOREIGN KEY ("eventPreferenceId") REFERENCES "EventPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventPreferenceToProfile" ADD CONSTRAINT "_EventPreferenceToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "EventPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventPreferenceToProfile" ADD CONSTRAINT "_EventPreferenceToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
