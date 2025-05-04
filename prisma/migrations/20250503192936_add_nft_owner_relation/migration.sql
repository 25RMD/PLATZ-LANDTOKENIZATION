-- AlterTable
ALTER TABLE "nfts" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "nfts_ownerId_idx" ON "nfts"("ownerId");

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
