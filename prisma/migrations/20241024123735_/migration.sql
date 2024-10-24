/*
  Warnings:

  - You are about to drop the column `slug` on the `JobOffer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug_name]` on the table `JobOffer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug_name` to the `JobOffer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "JobOffer_slug_key";

-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "slug",
ADD COLUMN     "slug_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "JobOffer_slug_name_key" ON "JobOffer"("slug_name");
