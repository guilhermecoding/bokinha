/*
  Warnings:

  - You are about to drop the column `class` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "class",
ADD COLUMN     "school_class" TEXT;
