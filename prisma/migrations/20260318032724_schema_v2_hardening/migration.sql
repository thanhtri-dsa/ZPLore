/*
  Warnings:

  - You are about to drop the column `customerId` on the `AIPlannerBooking` table. All the data in the column will be lost.
  - You are about to drop the column `itemsUsed` on the `AIPlannerBooking` table. All the data in the column will be lost.
  - You are about to drop the column `publicToken` on the `AIPlannerBooking` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `PackageBooking` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImageEditSuggestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TourType" AS ENUM ('DAYS', 'NIGHTS');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('CAR', 'BUS', 'TRAIN', 'PLANE', 'BOAT', 'WALK', 'BIKE', 'BICYCLE', 'MOTORBIKE');

-- DropForeignKey
ALTER TABLE "AIPlannerBooking" DROP CONSTRAINT "AIPlannerBooking_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PackageBooking" DROP CONSTRAINT "PackageBooking_customerId_fkey";

-- DropIndex
DROP INDEX "AIPlannerBooking_customerId_createdAt_idx";

-- DropIndex
DROP INDEX "AIPlannerBooking_email_createdAt_idx";

-- DropIndex
DROP INDEX "AIPlannerBooking_publicToken_key";

-- DropIndex
DROP INDEX "Booking_customerId_createdAt_idx";

-- DropIndex
DROP INDEX "Booking_email_createdAt_idx";

-- DropIndex
DROP INDEX "PackageBooking_customerId_createdAt_idx";

-- AlterTable
ALTER TABLE "AIPlannerBooking" DROP COLUMN "customerId",
DROP COLUMN "itemsUsed",
DROP COLUMN "publicToken",
ADD COLUMN     "statusV2" "BookingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transportModeV2" "TransportMode" NOT NULL DEFAULT 'CAR';

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "customerId",
ADD COLUMN     "statusV2" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "tourTypeV2" "TourType" NOT NULL DEFAULT 'DAYS';

-- AlterTable
ALTER TABLE "PackageBooking" DROP COLUMN "customerId",
ADD COLUMN     "statusV2" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PackageItineraryLeg" ADD COLUMN     "modeV2" "TransportMode" NOT NULL DEFAULT 'CAR';

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "ImageEditSuggestion";

-- DropEnum
DROP TYPE "ImageEditSuggestionStatus";

-- DropEnum
DROP TYPE "ImageEntityType";

-- CreateTable
CREATE TABLE "CommunityPostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPostSave" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityPostLike_userId_createdAt_idx" ON "CommunityPostLike"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPostLike_postId_userId_key" ON "CommunityPostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "CommunityPostSave_userId_createdAt_idx" ON "CommunityPostSave"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPostSave_postId_userId_key" ON "CommunityPostSave"("postId", "userId");

-- CreateIndex
CREATE INDEX "AIPlannerBooking_createdAt_idx" ON "AIPlannerBooking"("createdAt");

-- CreateIndex
CREATE INDEX "Blog_createdAt_idx" ON "Blog"("createdAt");

-- CreateIndex
CREATE INDEX "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_statusV2_idx" ON "Booking"("statusV2");

-- CreateIndex
CREATE INDEX "CommunityComment_postId_createdAt_idx" ON "CommunityComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityComment_userId_createdAt_idx" ON "CommunityComment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityPost_userId_createdAt_idx" ON "CommunityPost"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Destination_country_city_idx" ON "Destination"("country", "city");

-- CreateIndex
CREATE INDEX "Destination_createdAt_idx" ON "Destination"("createdAt");

-- CreateIndex
CREATE INDEX "Included_packageId_idx" ON "Included"("packageId");

-- CreateIndex
CREATE INDEX "Package_createdAt_idx" ON "Package"("createdAt");

-- CreateIndex
CREATE INDEX "Package_price_idx" ON "Package"("price");

-- CreateIndex
CREATE INDEX "PackageBooking_packageId_createdAt_idx" ON "PackageBooking"("packageId", "createdAt");

-- CreateIndex
CREATE INDEX "PackageBooking_userId_createdAt_idx" ON "PackageBooking"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PackageBooking_statusV2_idx" ON "PackageBooking"("statusV2");

-- CreateIndex
CREATE INDEX "PackageItineraryLeg_packageId_order_idx" ON "PackageItineraryLeg"("packageId", "order");

-- AddForeignKey
ALTER TABLE "CommunityPostLike" ADD CONSTRAINT "CommunityPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostSave" ADD CONSTRAINT "CommunityPostSave_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
