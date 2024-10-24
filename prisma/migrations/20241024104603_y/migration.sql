/*
  Warnings:

  - You are about to drop the column `status` on the `JobOffer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "UserJobOffer" ADD COLUMN     "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "coverLetter" SET DEFAULT '';
