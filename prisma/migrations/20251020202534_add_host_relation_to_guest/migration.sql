-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "hostId" INTEGER;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;
