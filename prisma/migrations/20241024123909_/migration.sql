/*
  Warnings:

  - You are about to drop the column `slug_name` on the `JobOffer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `JobOffer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `JobOffer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "JobOffer_slug_name_key";

-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "slug_name",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "JobOffer_slug_key" ON "JobOffer"("slug");
