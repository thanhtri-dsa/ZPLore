-- CreateEnum
CREATE TYPE "ImageEntityType" AS ENUM ('DESTINATION', 'PACKAGE', 'BLOG', 'COMMUNITY_POST');

-- CreateEnum
CREATE TYPE "ImageEditSuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ImageEditSuggestion" (
    "id" TEXT NOT NULL,
    "entityType" "ImageEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT 'imageData',
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "note" TEXT,
    "status" "ImageEditSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageEditSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImageEditSuggestion_entityType_entityId_idx" ON "ImageEditSuggestion"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ImageEditSuggestion_status_createdAt_idx" ON "ImageEditSuggestion"("status", "createdAt");
