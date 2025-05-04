-- AlterTable
ALTER TABLE "nfts" ADD COLUMN     "isListed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "nfts_isListed_idx" ON "nfts"("isListed");
