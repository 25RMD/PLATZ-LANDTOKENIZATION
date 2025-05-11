/*
  Warnings:

  - You are about to drop the column `collection_id` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `contract_address` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `main_token_id` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `metadata_uri` on the `land_listings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "land_listings_collection_id_idx";

-- DropIndex
DROP INDEX "land_listings_contract_address_idx";

-- DropIndex
DROP INDEX "land_listings_main_token_id_idx";

-- AlterTable
ALTER TABLE "land_listings" DROP COLUMN "collection_id",
DROP COLUMN "contract_address",
DROP COLUMN "main_token_id",
DROP COLUMN "metadata_uri",
ADD COLUMN     "collectionId" BIGINT,
ADD COLUMN     "contractAddress" TEXT,
ADD COLUMN     "mainTokenId" BIGINT,
ADD COLUMN     "metadataUri" TEXT;

-- CreateIndex
CREATE INDEX "land_listings_contractAddress_idx" ON "land_listings"("contractAddress");

-- CreateIndex
CREATE INDEX "land_listings_collectionId_idx" ON "land_listings"("collectionId");

-- CreateIndex
CREATE INDEX "land_listings_mainTokenId_idx" ON "land_listings"("mainTokenId");
