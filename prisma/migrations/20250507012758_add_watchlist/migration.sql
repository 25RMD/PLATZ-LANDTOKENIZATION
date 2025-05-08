-- CreateTable
CREATE TABLE "watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "watchlist_userId_idx" ON "watchlist"("userId");

-- CreateIndex
CREATE INDEX "watchlist_collectionId_idx" ON "watchlist"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_userId_collectionId_key" ON "watchlist"("userId", "collectionId");

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "land_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
