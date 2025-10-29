/*
  Warnings:

  - A unique constraint covering the columns `[hostId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Playlist_hostId_key" ON "Playlist"("hostId");
