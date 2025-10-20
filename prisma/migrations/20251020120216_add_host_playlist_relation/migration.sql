/*
  Warnings:

  - A unique constraint covering the columns `[hostToken]` on the table `Host` will be added. If there are existing duplicate values, this will fail.
  - The required column `hostToken` was added to the `Host` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "hostToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "hostId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Host_hostToken_key" ON "Host"("hostToken");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;
