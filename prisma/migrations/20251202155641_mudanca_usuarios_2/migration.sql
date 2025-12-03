/*
  Warnings:

  - The values [ADMIN,STUDENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `contestId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `solvedAt` on the `solved_questions` table. All the data in the column will be lost.
  - Added the required column `admin_password` to the `contests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `contests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `contests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `contests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contest_id` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'student');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_contestId_fkey";

-- AlterTable
ALTER TABLE "contests" ADD COLUMN     "admin_password" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "contestId",
ADD COLUMN     "balloon_color" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "contest_id" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "solved_questions" DROP COLUMN "solvedAt",
ADD COLUMN     "solved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
