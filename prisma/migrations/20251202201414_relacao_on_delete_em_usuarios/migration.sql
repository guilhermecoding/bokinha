-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_contest_id_fkey";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
