/*
  Warnings:

  - You are about to drop the column `coverLetter` on the `JobOffer` table. All the data in the column will be lost.
  - Made the column `status` on table `JobOffer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "coverLetter",
ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserJobOffer" ADD COLUMN     "coverLetter" TEXT;
