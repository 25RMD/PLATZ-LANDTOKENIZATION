/*
  Warnings:

  - You are about to drop the column `listing_price` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `nft_description` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `price_currency` on the `land_listings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `land_listings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mint_address]` on the table `land_listings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "land_listings_kycStatus_idx";

-- DropIndex
DROP INDEX "land_listings_status_idx";

-- AlterTable
ALTER TABLE "land_listings" DROP COLUMN "listing_price",
DROP COLUMN "nft_description",
DROP COLUMN "price_currency",
ADD COLUMN     "blockchain_ref" TEXT,
ADD COLUMN     "is_listed_for_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listingPrice" DECIMAL(18,8),
ADD COLUMN     "listing_price_sol" DOUBLE PRECISION,
ADD COLUMN     "metadata_uri" TEXT,
ADD COLUMN     "mint_address" TEXT,
ADD COLUMN     "nftDescription" TEXT,
ADD COLUMN     "on_chain_owner_public_key" TEXT,
ADD COLUMN     "priceCurrency" TEXT DEFAULT 'SOL',
ADD COLUMN     "propertyDescription" TEXT,
ADD COLUMN     "property_area_sqm" DOUBLE PRECISION,
ADD COLUMN     "property_photos_file_ref" TEXT[],
ADD COLUMN     "property_valuation" TEXT,
ADD COLUMN     "property_valuation_file_ref" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "valuationDate" DATE,
ADD COLUMN     "zoningClassification" TEXT,
ADD COLUMN     "zoning_compliance_file_ref" TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "land_listings_slug_key" ON "land_listings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "land_listings_mint_address_key" ON "land_listings"("mint_address");

-- CreateIndex
CREATE INDEX "land_listings_mint_address_idx" ON "land_listings"("mint_address");

-- CreateIndex
CREATE INDEX "land_listings_on_chain_owner_public_key_idx" ON "land_listings"("on_chain_owner_public_key");

-- CreateIndex
CREATE INDEX "land_listings_is_listed_for_sale_idx" ON "land_listings"("is_listed_for_sale");
