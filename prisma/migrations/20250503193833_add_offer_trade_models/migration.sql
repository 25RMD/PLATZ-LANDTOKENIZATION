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

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

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

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "nfts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_offererId_fkey" FOREIGN KEY ("offererId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "nfts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
