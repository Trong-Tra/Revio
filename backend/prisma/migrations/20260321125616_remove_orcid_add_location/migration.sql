/*
  Warnings:

  - You are about to drop the column `orcid_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "orcid_id",
ADD COLUMN     "location" TEXT DEFAULT '',
ALTER COLUMN "name" SET DEFAULT '',
ALTER COLUMN "affiliation" SET DEFAULT '',
ALTER COLUMN "bio" SET DEFAULT '';
