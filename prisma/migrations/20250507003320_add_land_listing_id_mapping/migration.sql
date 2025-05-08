-- AlterTable
ALTER TABLE "nfts" ADD COLUMN     "land_listing_id" TEXT,
ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_land_listing_id_fkey" FOREIGN KEY ("land_listing_id") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
