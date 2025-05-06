-- AlterTable
ALTER TABLE "land_listings" ADD COLUMN     "listing_price" DECIMAL(65,30),
ADD COLUMN     "nft_collection_size" INTEGER DEFAULT 100,
ADD COLUMN     "nft_description" TEXT,
ADD COLUMN     "nft_image_file_ref" TEXT,
ADD COLUMN     "nft_title" TEXT,
ADD COLUMN     "price_currency" TEXT DEFAULT 'SOL';
