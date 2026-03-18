/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `AIPlannerBooking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AIPlannerBooking" ADD COLUMN     "itemsUsed" TEXT,
ADD COLUMN     "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AIPlannerBooking_publicToken_key" ON "AIPlannerBooking"("publicToken");
