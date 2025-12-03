/*
  Warnings:

  - The values [admin,student] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `admin_password` on the `contests` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `contests` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `contests` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `contests` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `contests` table. All the data in the column will be lost.
  - You are about to drop the column `balloon_color` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `contest_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `solved_questions` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contestId` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'STUDENT');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "solved_questions" DROP CONSTRAINT "solved_questions_student_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_contest_id_fkey";

-- AlterTable
ALTER TABLE "contests" DROP COLUMN "admin_password",
DROP COLUMN "created_at",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "balloon_color",
DROP COLUMN "contest_id",
DROP COLUMN "order",
ADD COLUMN     "contestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "solved_questions" DROP COLUMN "student_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "class",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "contest_id" TEXT,
ADD COLUMN     "turma" TEXT,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- DropTable
DROP TABLE "students";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
