/*
  Warnings:

  - You are about to drop the column `turma` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "turma",
ADD COLUMN     "class" TEXT;
