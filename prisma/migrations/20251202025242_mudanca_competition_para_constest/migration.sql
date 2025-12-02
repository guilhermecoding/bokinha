/*
  Warnings:

  - You are about to drop the column `competition_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `competition_id` on the `students` table. All the data in the column will be lost.
  - You are about to drop the `competitions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contest_id` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contest_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_competition_id_fkey";

-- DropIndex
DROP INDEX "students_competition_id_idx";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "competition_id",
ADD COLUMN     "contest_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "competition_id",
ADD COLUMN     "contest_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "competitions";

-- CreateTable
CREATE TABLE "contests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admin_password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contests_slug_key" ON "contests"("slug");

-- CreateIndex
CREATE INDEX "students_contest_id_idx" ON "students"("contest_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
