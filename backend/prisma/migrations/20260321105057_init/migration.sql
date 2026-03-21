-- CreateEnum
CREATE TYPE "paper_tier" AS ENUM ('ENTRY', 'STANDARD', 'PREMIUM', 'ELITE');

-- CreateEnum
CREATE TYPE "paper_status" AS ENUM ('PENDING', 'UNDER_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "review_decision" AS ENUM ('ACCEPT', 'REJECT', 'MAJOR_REVISION', 'MINOR_REVISION', 'WEAK_ACCEPT');

-- CreateEnum
CREATE TYPE "reviewer_type" AS ENUM ('AI', 'HUMAN');

-- CreateEnum
CREATE TYPE "agent_type" AS ENUM ('REVIEWER', 'ANALYST', 'CURATOR');

-- CreateEnum
CREATE TYPE "agent_tier" AS ENUM ('ENTRY', 'STANDARD', 'PREMIUM', 'ELITE');

-- CreateEnum
CREATE TYPE "skill_level" AS ENUM ('NOVICE', 'PROFICIENT', 'EXPERT');

-- CreateTable
CREATE TABLE "papers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "abstract" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "field" TEXT NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "pdf_key" TEXT NOT NULL,
    "doi" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "decision" TEXT,
    "extracted_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skill_confidence" DOUBLE PRECISION,
    "conference_id" TEXT,
    "tier" "paper_tier" NOT NULL DEFAULT 'STANDARD',
    "status" "paper_status" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_agents" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "reviewer_type" "reviewer_type" NOT NULL,
    "reviewer_id" TEXT,
    "content" JSONB NOT NULL,
    "overall_score" DOUBLE PRECISION,
    "confidence_score" DOUBLE PRECISION,
    "decision" "review_decision",
    "is_accepted" BOOLEAN,
    "aspects" JSONB,
    "agent_tier" TEXT,
    "skill_match_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_skills" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "skill_level" NOT NULL DEFAULT 'NOVICE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_reputations" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "tier" "agent_tier" NOT NULL DEFAULT 'ENTRY',
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "accuracy_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "helpfulness_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consistency_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overall_reputation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews_this_week" INTEGER NOT NULL DEFAULT 0,
    "last_review_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_reputations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agent_type" "agent_type" NOT NULL DEFAULT 'REVIEWER',
    "skills_url" TEXT NOT NULL DEFAULT '/SKILL.md',
    "review_url" TEXT NOT NULL DEFAULT '/REVIEW.md',
    "fields_url" TEXT NOT NULL DEFAULT '/FIELDS.md',
    "ethics_url" TEXT NOT NULL DEFAULT '/ETHICS.md',
    "tone" TEXT NOT NULL DEFAULT 'Academic',
    "system_prompt" TEXT NOT NULL,
    "fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_by" TEXT,
    "api_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reviewer',
    "avatar_url" TEXT,
    "orcid_id" TEXT,
    "affiliation" TEXT,
    "bio" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conferences" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "tier" "paper_tier" NOT NULL DEFAULT 'STANDARD',
    "required_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publisher" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "papers_doi_key" ON "papers"("doi");

-- CreateIndex
CREATE INDEX "papers_field_idx" ON "papers"("field");

-- CreateIndex
CREATE INDEX "papers_keywords_idx" ON "papers"("keywords");

-- CreateIndex
CREATE INDEX "papers_created_at_idx" ON "papers"("created_at");

-- CreateIndex
CREATE INDEX "papers_title_idx" ON "papers"("title");

-- CreateIndex
CREATE INDEX "papers_tier_idx" ON "papers"("tier");

-- CreateIndex
CREATE INDEX "papers_status_idx" ON "papers"("status");

-- CreateIndex
CREATE INDEX "reviews_paper_id_idx" ON "reviews"("paper_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_type_idx" ON "reviews"("reviewer_type");

-- CreateIndex
CREATE INDEX "agent_skills_agent_id_idx" ON "agent_skills"("agent_id");

-- CreateIndex
CREATE INDEX "agent_skills_name_idx" ON "agent_skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_skills_agent_id_name_key" ON "agent_skills"("agent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_reputations_agent_id_key" ON "agent_reputations"("agent_id");

-- CreateIndex
CREATE INDEX "agent_reputations_tier_idx" ON "agent_reputations"("tier");

-- CreateIndex
CREATE INDEX "agent_reputations_overall_reputation_idx" ON "agent_reputations"("overall_reputation");

-- CreateIndex
CREATE UNIQUE INDEX "agent_configs_name_key" ON "agent_configs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_configs_api_key_key" ON "agent_configs"("api_key");

-- CreateIndex
CREATE INDEX "agent_configs_is_active_idx" ON "agent_configs"("is_active");

-- CreateIndex
CREATE INDEX "agent_configs_agent_type_idx" ON "agent_configs"("agent_type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "conferences_tier_idx" ON "conferences"("tier");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
