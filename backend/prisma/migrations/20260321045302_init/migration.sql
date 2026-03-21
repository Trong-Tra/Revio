-- CreateEnum
CREATE TYPE "reviewer_type" AS ENUM ('AI', 'HUMAN');

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
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "reviewer_type" "reviewer_type" NOT NULL,
    "reviewer_id" TEXT,
    "content" JSONB NOT NULL,
    "is_accepted" BOOLEAN,
    "confidence_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "skills_markdown" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'Academic',
    "system_prompt" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "reviews_paper_id_idx" ON "reviews"("paper_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_type_idx" ON "reviews"("reviewer_type");

-- CreateIndex
CREATE UNIQUE INDEX "agent_configs_name_key" ON "agent_configs"("name");

-- CreateIndex
CREATE INDEX "agent_configs_is_active_idx" ON "agent_configs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
