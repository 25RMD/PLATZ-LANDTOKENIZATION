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
    "certIssueDate" DATE,
    "certExpiryDate" DATE,
    "encumbrance_file_ref" TEXT,
    "encumbranceId" TEXT,
    "encumbrancePeriodStart" DATE,
    "encumbrancePeriodEnd" DATE,
    "parcelNumber" TEXT,
    "registryVolume" TEXT,
    "registryPage" TEXT,
    "survey_plan_file_ref" TEXT,
    "surveyPlanNumber" TEXT,
    "surveyDate" DATE,
    "latitude" TEXT,
    "longitude" TEXT,
    "gis_file_ref" TEXT,
    "ownerName" TEXT,
    "govIdNumber" TEXT,
    "idIssueDate" DATE,
    "idExpiryDate" DATE,
    "id_document_file_ref" TEXT,
    "address_proof_file_ref" TEXT,
    "kycStatus" TEXT DEFAULT 'PENDING',
    "title_search_file_ref" TEXT,
    "title_opinion_file_ref" TEXT,
    "recordedInstruments" TEXT,
    "docHash" TEXT,
    "ipfsUri" TEXT,
    "mintTimestamp" TIMESTAMP(3),
    "tokenId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "additionalNotes" TEXT,

    CONSTRAINT "land_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "land_listings_userId_idx" ON "land_listings"("userId");

-- CreateIndex
CREATE INDEX "land_listings_status_idx" ON "land_listings"("status");

-- CreateIndex
CREATE INDEX "land_listings_kycStatus_idx" ON "land_listings"("kycStatus");

-- AddForeignKey
ALTER TABLE "land_listings" ADD CONSTRAINT "land_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
