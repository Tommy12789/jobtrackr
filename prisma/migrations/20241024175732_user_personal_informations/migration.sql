/*
  Warnings:

  - You are about to drop the column `address` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `resume` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "phone",
DROP COLUMN "resume",
DROP COLUMN "zip";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT DEFAULT '',
ADD COLUMN     "city" TEXT DEFAULT '',
ADD COLUMN     "country" TEXT DEFAULT '',
ADD COLUMN     "first_name" TEXT DEFAULT '',
ADD COLUMN     "last_name" TEXT DEFAULT '',
ADD COLUMN     "phone" TEXT DEFAULT '',
ADD COLUMN     "resume" TEXT DEFAULT '',
ADD COLUMN     "zip" TEXT DEFAULT '';
