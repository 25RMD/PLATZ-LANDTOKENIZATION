/*
  Warnings:

  - You are about to drop the column `blockchain_ref` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `listing_price_sol` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `mintTimestamp` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `mint_address` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `on_chain_owner_public_key` on the `land_listings` table. All the data in the column will be lost.
  - You are about to drop the column `solana_pub_key` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[evm_address]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "land_listings_mint_address_idx";

-- DropIndex
DROP INDEX "land_listings_mint_address_key";

-- DropIndex
DROP INDEX "land_listings_on_chain_owner_public_key_idx";

-- DropIndex
DROP INDEX "idx_users_solana_pub_key";

-- DropIndex
DROP INDEX "users_solana_pub_key_key";

-- AlterTable
ALTER TABLE "land_listings" DROP COLUMN "blockchain_ref",
DROP COLUMN "listing_price_sol",
DROP COLUMN "mintTimestamp",
DROP COLUMN "mint_address",
DROP COLUMN "on_chain_owner_public_key",
ADD COLUMN     "collection_id" INTEGER,
ADD COLUMN     "contract_address" TEXT,
ADD COLUMN     "evm_owner_address" TEXT,
ADD COLUMN     "listing_price_eth" DOUBLE PRECISION,
ADD COLUMN     "main_token_id" INTEGER,
ADD COLUMN     "mint_status" TEXT DEFAULT 'NOT_STARTED',
ADD COLUMN     "mint_timestamp" TIMESTAMP(3),
ADD COLUMN     "mint_transaction_hash" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "solana_pub_key",
ADD COLUMN     "evm_address" VARCHAR(42);

-- CreateTable
CREATE TABLE "evm_collection_tokens" (
    "id" TEXT NOT NULL,
    "land_listing_id" TEXT NOT NULL,
    "nft_id" TEXT,
    "token_id" INTEGER NOT NULL,
    "is_main_token" BOOLEAN NOT NULL DEFAULT false,
    "token_uri" TEXT NOT NULL,
    "owner_address" TEXT,
    "mint_transaction_hash" TEXT,
    "mint_timestamp" TIMESTAMP(3),
    "mint_status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "is_listed" BOOLEAN NOT NULL DEFAULT false,
    "listing_price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evm_collection_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evm_collection_tokens_land_listing_id_idx" ON "evm_collection_tokens"("land_listing_id");

-- CreateIndex
CREATE INDEX "evm_collection_tokens_nft_id_idx" ON "evm_collection_tokens"("nft_id");

-- CreateIndex
CREATE INDEX "evm_collection_tokens_token_id_idx" ON "evm_collection_tokens"("token_id");

-- CreateIndex
CREATE INDEX "evm_collection_tokens_is_main_token_idx" ON "evm_collection_tokens"("is_main_token");

-- CreateIndex
CREATE INDEX "evm_collection_tokens_owner_address_idx" ON "evm_collection_tokens"("owner_address");

-- CreateIndex
CREATE INDEX "evm_collection_tokens_mint_status_idx" ON "evm_collection_tokens"("mint_status");

-- CreateIndex
CREATE INDEX "evm_collection_tokens_is_listed_idx" ON "evm_collection_tokens"("is_listed");

-- CreateIndex
CREATE INDEX "land_listings_contract_address_idx" ON "land_listings"("contract_address");

-- CreateIndex
CREATE INDEX "land_listings_collection_id_idx" ON "land_listings"("collection_id");

-- CreateIndex
CREATE INDEX "land_listings_main_token_id_idx" ON "land_listings"("main_token_id");

-- CreateIndex
CREATE INDEX "land_listings_evm_owner_address_idx" ON "land_listings"("evm_owner_address");

-- CreateIndex
CREATE INDEX "land_listings_mint_status_idx" ON "land_listings"("mint_status");

-- CreateIndex
CREATE UNIQUE INDEX "users_evm_address_key" ON "users"("evm_address");

-- CreateIndex
CREATE INDEX "idx_users_evm_address" ON "users"("evm_address");

-- AddForeignKey
ALTER TABLE "evm_collection_tokens" ADD CONSTRAINT "evm_collection_tokens_land_listing_id_fkey" FOREIGN KEY ("land_listing_id") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evm_collection_tokens" ADD CONSTRAINT "evm_collection_tokens_nft_id_fkey" FOREIGN KEY ("nft_id") REFERENCES "nfts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
