/*
  Warnings:

  - You are about to drop the column `userId` on the `JobOffer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobOffer" DROP CONSTRAINT "JobOffer_userId_fkey";

-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserJobOffer" (
    "userId" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,

    CONSTRAINT "UserJobOffer_pkey" PRIMARY KEY ("userId","jobOfferId")
);

-- AddForeignKey
ALTER TABLE "UserJobOffer" ADD CONSTRAINT "UserJobOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobOffer" ADD CONSTRAINT "UserJobOffer_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("url") ON DELETE CASCADE ON UPDATE CASCADE;
