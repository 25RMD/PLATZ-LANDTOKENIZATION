-- AlterTable
ALTER TABLE "users" ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "gov_id_ref" TEXT,
ADD COLUMN     "gov_id_type" VARCHAR(50),
ADD COLUMN     "kyc_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" VARCHAR(20),
ADD COLUMN     "sof_doc_ref" TEXT;
