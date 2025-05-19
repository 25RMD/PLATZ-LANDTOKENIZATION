-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "items" INTEGER NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "floorPrice" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT,

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
    "propertyId" TEXT,
    "ownerId" TEXT,
    "isListed" BOOLEAN NOT NULL DEFAULT false,
    "land_listing_id" TEXT,

    CONSTRAINT "nfts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50),
    "email" VARCHAR(255),
    "password_hash" VARCHAR(255),
    "full_name" VARCHAR(100),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100),
    "state_province" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sign_in_nonce" VARCHAR(255),
    "evm_address" VARCHAR(42),
    "date_of_birth" DATE,
    "gov_id_ref" TEXT,
    "gov_id_type" VARCHAR(50),
    "kyc_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" VARCHAR(20),
    "auth_type" VARCHAR(20) NOT NULL DEFAULT 'email',
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "wallet_address" VARCHAR(42),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_update_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "changes" JSONB NOT NULL,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_update_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "nftId" TEXT NOT NULL,
    "offererId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "nftId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "land_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title_deed_file_ref" TEXT,
    "deedNumber" TEXT,
    "deedType" TEXT,
    "grantorName" TEXT,
    "granteeName" TEXT,
    "deedDate" DATE,
    "title_cert_file_ref" TEXT,
    "certNumber" TEXT,
    "cert_issue_date" DATE,
    "legal_description" TEXT,
    "parcel_number" TEXT,
    "property_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "property_type" TEXT,
    "property_area_sqm" DOUBLE PRECISION,
    "property_description" TEXT,
    "listing_title" TEXT,
    "listing_price" DOUBLE PRECISION,
    "price_currency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "mint_status" TEXT,
    "mint_error_reason" TEXT,
    "mint_timestamp" TIMESTAMP(3),
    "mint_transaction_hash" TEXT,
    "token_id" INTEGER,
    "contract_address" TEXT,
    "collection_id" INTEGER,
    "main_token_id" INTEGER,
    "metadata_uri" TEXT,
    "slug" TEXT,
    "cover_image_url" TEXT,
    "nft_description" TEXT,
    "nft_title" TEXT,
    "nft_image_file_ref" TEXT,
    "nft_collection_size" INTEGER,
    "marketplace_listing_id" INTEGER,
    "marketplace_listing_error" TEXT,
    "nft_image_irys_uri" TEXT,
    "nft_metadata_irys_uri" TEXT,
    "local_government_area" TEXT,
    "property_valuation" TEXT,
    "zoning_classification" TEXT,

    CONSTRAINT "land_listings_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_bids" (
    "id" TEXT NOT NULL,
    "land_listing_id" TEXT NOT NULL,
    "bidder_user_id" TEXT NOT NULL,
    "bid_amount" DOUBLE PRECISION NOT NULL,
    "bid_status" VARCHAR(20) NOT NULL,
    "transaction_hash" VARCHAR(66),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nft_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_transactions" (
    "id" TEXT NOT NULL,
    "land_listing_id" TEXT NOT NULL,
    "token_id" INTEGER NOT NULL,
    "from_address" VARCHAR(42) NOT NULL,
    "to_address" VARCHAR(42) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "transaction_hash" VARCHAR(66) NOT NULL,
    "transaction_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nft_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "properties_userId_idx" ON "properties"("userId");

-- CreateIndex
CREATE INDEX "nfts_propertyId_idx" ON "nfts"("propertyId");

-- CreateIndex
CREATE INDEX "nfts_ownerId_idx" ON "nfts"("ownerId");

-- CreateIndex
CREATE INDEX "nfts_isListed_idx" ON "nfts"("isListed");

-- CreateIndex
CREATE UNIQUE INDEX "nfts_propertyId_itemNumber_key" ON "nfts"("propertyId", "itemNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_evm_address_key" ON "users"("evm_address");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "idx_users_evm_address" ON "users"("evm_address");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "kyc_update_requests_userId_idx" ON "kyc_update_requests"("userId");

-- CreateIndex
CREATE INDEX "kyc_update_requests_status_idx" ON "kyc_update_requests"("status");

-- CreateIndex
CREATE INDEX "offers_nftId_idx" ON "offers"("nftId");

-- CreateIndex
CREATE INDEX "offers_offererId_idx" ON "offers"("offererId");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- CreateIndex
CREATE INDEX "trades_nftId_idx" ON "trades"("nftId");

-- CreateIndex
CREATE INDEX "trades_buyerId_idx" ON "trades"("buyerId");

-- CreateIndex
CREATE INDEX "trades_sellerId_idx" ON "trades"("sellerId");

-- CreateIndex
CREATE INDEX "trades_timestamp_idx" ON "trades"("timestamp");

-- CreateIndex
CREATE INDEX "trades_creatorId_idx" ON "trades"("creatorId");

-- CreateIndex
CREATE INDEX "watchlist_userId_idx" ON "watchlist"("userId");

-- CreateIndex
CREATE INDEX "watchlist_collectionId_idx" ON "watchlist"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_userId_collectionId_key" ON "watchlist"("userId", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "land_listings_slug_key" ON "land_listings"("slug");

-- CreateIndex
CREATE INDEX "land_listings_userId_idx" ON "land_listings"("userId");

-- CreateIndex
CREATE INDEX "land_listings_status_idx" ON "land_listings"("status");

-- CreateIndex
CREATE INDEX "land_listings_mint_status_idx" ON "land_listings"("mint_status");

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
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_land_listing_id_fkey" FOREIGN KEY ("land_listing_id") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_update_requests" ADD CONSTRAINT "kyc_update_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "nfts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_offererId_fkey" FOREIGN KEY ("offererId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "nfts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_listings" ADD CONSTRAINT "land_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evm_collection_tokens" ADD CONSTRAINT "evm_collection_tokens_land_listing_id_fkey" FOREIGN KEY ("land_listing_id") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evm_collection_tokens" ADD CONSTRAINT "evm_collection_tokens_nft_id_fkey" FOREIGN KEY ("nft_id") REFERENCES "nfts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nft_bids" ADD CONSTRAINT "nft_bids_bidder_user_id_fkey" FOREIGN KEY ("bidder_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nft_bids" ADD CONSTRAINT "nft_bids_land_listing_id_fkey" FOREIGN KEY ("land_listing_id") REFERENCES "land_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nft_transactions" ADD CONSTRAINT "nft_transactions_land_listing_id_fkey" FOREIGN KEY ("land_listing_id") REFERENCES "land_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
