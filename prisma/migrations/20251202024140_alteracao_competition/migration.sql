/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `competitions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `end_time` to the `competitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `competitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `competitions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "competitions_slug_key" ON "competitions"("slug");

-- CreateIndex
CREATE INDEX "students_competition_id_idx" ON "students"("competition_id");
