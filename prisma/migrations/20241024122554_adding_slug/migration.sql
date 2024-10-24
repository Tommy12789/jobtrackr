/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `JobOffer` will be added. If there are existing duplicate values, this will fail.
  - The required column `slug` was added to the `JobOffer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "JobOffer_slug_key" ON "JobOffer"("slug");
