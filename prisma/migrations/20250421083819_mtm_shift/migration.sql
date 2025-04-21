/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Shift` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_employeeId_fkey";

-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "employeeId";

-- CreateTable
CREATE TABLE "_EmployeeToShift" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeToShift_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmployeeToShift_B_index" ON "_EmployeeToShift"("B");

-- AddForeignKey
ALTER TABLE "_EmployeeToShift" ADD CONSTRAINT "_EmployeeToShift_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToShift" ADD CONSTRAINT "_EmployeeToShift_B_fkey" FOREIGN KEY ("B") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
