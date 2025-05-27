/*
  Warnings:

  - Added the required column `token_id` to the `nft_bids` table without a default value. This is not possible if the table is not empty.

*/
-- Add the column with a default value for existing rows
ALTER TABLE "nft_bids" ADD COLUMN "token_id" INTEGER NOT NULL DEFAULT 0;

-- Update existing bids to have tokenId 0 (representing collection-level bids)
-- These are legacy bids that were placed on collections, not specific tokens
UPDATE "nft_bids" SET "token_id" = 0 WHERE "token_id" = 0;

-- CreateIndex
CREATE INDEX "nft_bids_token_id_idx" ON "nft_bids"("token_id");

-- CreateIndex
CREATE INDEX "nft_bids_land_listing_id_idx" ON "nft_bids"("land_listing_id");

-- CreateIndex
CREATE INDEX "nft_bids_bidder_user_id_idx" ON "nft_bids"("bidder_user_id");

-- CreateIndex
CREATE INDEX "nft_bids_bid_status_idx" ON "nft_bids"("bid_status");
