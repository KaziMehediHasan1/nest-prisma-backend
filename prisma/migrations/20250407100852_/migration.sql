/*
  Warnings:

  - A unique constraint covering the columns `[decorationId]` on the table `Venue` will be added. If there are existing duplicate values, this will fail.

*/
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

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "decorationId" TEXT;

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

-- CreateIndex
CREATE UNIQUE INDEX "Venue_decorationId_key" ON "Venue"("decorationId");

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_decorationId_fkey" FOREIGN KEY ("decorationId") REFERENCES "Decoration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
