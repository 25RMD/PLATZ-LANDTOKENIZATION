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

-- CreateIndex
CREATE INDEX "kyc_update_requests_userId_idx" ON "kyc_update_requests"("userId");

-- CreateIndex
CREATE INDEX "kyc_update_requests_status_idx" ON "kyc_update_requests"("status");

-- AddForeignKey
ALTER TABLE "kyc_update_requests" ADD CONSTRAINT "kyc_update_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
