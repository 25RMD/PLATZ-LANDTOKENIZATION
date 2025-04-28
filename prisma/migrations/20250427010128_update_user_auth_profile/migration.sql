/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date_of_birth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `nonce` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NFT` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[solana_pub_key]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_collectionId_fkey";

-- DropIndex
DROP INDEX "idx_users_wallet_address";

-- DropIndex
DROP INDEX "users_wallet_address_key";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "date_of_birth",
DROP COLUMN "nonce",
DROP COLUMN "wallet_address",
ADD COLUMN     "sign_in_nonce" VARCHAR(255),
ADD COLUMN     "solana_pub_key" VARCHAR(44),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Collection";

-- DropTable
DROP TABLE "NFT";

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "items" INTEGER NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "floorPrice" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemNumber" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "nfts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nfts_propertyId_idx" ON "nfts"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "nfts_propertyId_itemNumber_key" ON "nfts"("propertyId", "itemNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_solana_pub_key_key" ON "users"("solana_pub_key");

-- CreateIndex
CREATE INDEX "idx_users_solana_pub_key" ON "users"("solana_pub_key");

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_users_email" RENAME TO "users_email_idx";

-- RenameIndex
ALTER INDEX "idx_users_username" RENAME TO "users_username_idx";
