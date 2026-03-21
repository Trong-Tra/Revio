/*
  Warnings:

  - Added the required column `user_id` to the `papers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "papers" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "papers_user_id_idx" ON "papers"("user_id");

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
