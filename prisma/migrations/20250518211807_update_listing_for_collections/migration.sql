/*
  Warnings:

  - You are about to drop the column `metadata_uri` on the `land_listings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[collection_id]` on the table `land_listings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "land_listings" DROP COLUMN "metadata_uri",
ADD COLUMN     "child_tokens_base_url" TEXT,
ADD COLUMN     "collection_metadata_url" TEXT,
ADD COLUMN     "collection_nft_title" TEXT,
ADD COLUMN     "main_token_metadata_url" TEXT,
ALTER COLUMN "collection_id" SET DATA TYPE TEXT,
ALTER COLUMN "main_token_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "land_listings_collection_id_key" ON "land_listings"("collection_id");
