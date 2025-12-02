/*
  Warnings:

  - You are about to drop the column `questionId` on the `solved_questions` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `solved_questions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `solved_questions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,question_id]` on the table `solved_questions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `question_id` to the `solved_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `solved_questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "solved_questions" DROP CONSTRAINT "solved_questions_questionId_fkey";

-- DropForeignKey
ALTER TABLE "solved_questions" DROP CONSTRAINT "solved_questions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "solved_questions" DROP CONSTRAINT "solved_questions_userId_fkey";

-- DropIndex
DROP INDEX "solved_questions_userId_questionId_key";

-- AlterTable
ALTER TABLE "solved_questions" DROP COLUMN "questionId",
DROP COLUMN "studentId",
DROP COLUMN "userId",
ADD COLUMN     "question_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "solved_questions_user_id_question_id_key" ON "solved_questions"("user_id", "question_id");

-- AddForeignKey
ALTER TABLE "solved_questions" ADD CONSTRAINT "solved_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solved_questions" ADD CONSTRAINT "solved_questions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solved_questions" ADD CONSTRAINT "solved_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
