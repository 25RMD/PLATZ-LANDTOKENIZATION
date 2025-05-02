/*
  Warnings:

  - You are about to drop the column `creator` on the `properties` table. All the data in the column will be lost.
  - Added the required column `userId` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "creator",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "properties_userId_idx" ON "properties"("userId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
