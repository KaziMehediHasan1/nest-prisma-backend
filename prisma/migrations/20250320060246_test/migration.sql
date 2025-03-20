/*
  Warnings:

  - Added the required column `bucket` to the `FileInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileInstance" ADD COLUMN     "bucket" TEXT NOT NULL;
