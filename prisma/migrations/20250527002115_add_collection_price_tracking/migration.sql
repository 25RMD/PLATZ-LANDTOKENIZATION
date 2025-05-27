-- CreateTable
CREATE TABLE "collection_price_history" (
    "id" TEXT NOT NULL,
    "land_listing_id" TEXT NOT NULL,
    "price_type" VARCHAR(20) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "previous_price" DOUBLE PRECISION,
    "change_percentage" DOUBLE PRECISION,
    "bid_id" TEXT,
    "transaction_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_price_history_land_listing_id_idx" ON "collection_price_history"("land_listing_id");

-- CreateIndex
CREATE INDEX "collection_price_history_price_type_idx" ON "collection_price_history"("price_type");

-- CreateIndex
CREATE INDEX "collection_price_history_created_at_idx" ON "collection_price_history"("created_at");

-- AddForeignKey
ALTER TABLE "collection_price_history" ADD CONSTRAINT "collection_price_history_land_listing_id_fkey" FOREIGN KEY ("land_listing_id") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
