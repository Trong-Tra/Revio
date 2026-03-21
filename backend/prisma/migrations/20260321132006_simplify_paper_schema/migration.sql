/*
  Warnings:

  - The `tier` column on the `conferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assigned_agents` on the `papers` table. All the data in the column will be lost.
  - You are about to drop the column `decision` on the `papers` table. All the data in the column will be lost.
  - You are about to drop the column `extracted_skills` on the `papers` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `papers` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `papers` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `papers` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `papers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "conference_tier" AS ENUM ('ENTRY', 'STANDARD', 'PREMIUM', 'ELITE');

-- CreateEnum
CREATE TYPE "conference_status" AS ENUM ('UPCOMING', 'ACTIVE', 'ARCHIVED');

-- DropIndex
DROP INDEX "papers_status_idx";

-- DropIndex
DROP INDEX "papers_tier_idx";

-- AlterTable
ALTER TABLE "conferences" ADD COLUMN     "status" "conference_status" NOT NULL DEFAULT 'UPCOMING',
DROP COLUMN "tier",
ADD COLUMN     "tier" "conference_tier" NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "papers" DROP COLUMN "assigned_agents",
DROP COLUMN "decision",
DROP COLUMN "extracted_skills",
DROP COLUMN "metadata",
DROP COLUMN "rating",
DROP COLUMN "status",
DROP COLUMN "tier",
ADD COLUMN     "final_result" TEXT,
ADD COLUMN     "reviewers" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "paper_status";

-- DropEnum
DROP TYPE "paper_tier";

-- CreateIndex
CREATE INDEX "conferences_tier_idx" ON "conferences"("tier");

-- CreateIndex
CREATE INDEX "conferences_status_idx" ON "conferences"("status");
