-- AlterEnum
BEGIN;
CREATE TYPE "ListingStatus_new" AS ENUM ('draft', 'active', 'inactive', 'pending', 'approved', 'rejected');
ALTER TABLE "land_listings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "land_listings" ALTER COLUMN "status" TYPE "ListingStatus_new" USING (LOWER("status"::text)::"ListingStatus_new");
ALTER TYPE "ListingStatus" RENAME TO "ListingStatus_old";
ALTER TYPE "ListingStatus_new" RENAME TO "ListingStatus";
DROP TYPE "ListingStatus_old";
ALTER TABLE "land_listings" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;



