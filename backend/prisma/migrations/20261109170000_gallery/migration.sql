CREATE TYPE "GalleryMediaType" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "GalleryOrientation" AS ENUM ('PORTRAIT', 'LANDSCAPE');

CREATE TABLE "GalleryAsset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Projet',
    "mediaType" "GalleryMediaType" NOT NULL,
    "mediaPath" TEXT NOT NULL,
    "orientation" "GalleryOrientation" NOT NULL DEFAULT 'LANDSCAPE',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GalleryAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GalleryAsset_published_mediaType_createdAt_idx" ON "GalleryAsset"("published", "mediaType", "createdAt");
