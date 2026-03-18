-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "CommunityComment" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "PackageBooking" ADD COLUMN     "userId" TEXT;
