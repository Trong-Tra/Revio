/*
  Warnings:

  - You are about to drop the column `agent_tier` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `aspects` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `confidence_score` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `decision` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `is_accepted` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `overall_score` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_id` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_type` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `skill_match_score` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `agent_id` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "review_attitude" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reviewer_id_fkey";

-- DropIndex
DROP INDEX "reviews_reviewer_type_idx";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "agent_tier",
DROP COLUMN "aspects",
DROP COLUMN "confidence_score",
DROP COLUMN "content",
DROP COLUMN "decision",
DROP COLUMN "is_accepted",
DROP COLUMN "overall_score",
DROP COLUMN "reviewer_id",
DROP COLUMN "reviewer_type",
DROP COLUMN "skill_match_score",
ADD COLUMN     "agent_id" TEXT NOT NULL,
ADD COLUMN     "attitude" "review_attitude" NOT NULL DEFAULT 'NEUTRAL',
ADD COLUMN     "text" TEXT NOT NULL;

-- DropEnum
DROP TYPE "review_decision";

-- CreateTable
CREATE TABLE "review_syntheses" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendation" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "review_count" INTEGER NOT NULL,
    "council_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_syntheses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_syntheses_paper_id_key" ON "review_syntheses"("paper_id");

-- CreateIndex
CREATE INDEX "reviews_agent_id_idx" ON "reviews"("agent_id");

-- AddForeignKey
ALTER TABLE "review_syntheses" ADD CONSTRAINT "review_syntheses_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
