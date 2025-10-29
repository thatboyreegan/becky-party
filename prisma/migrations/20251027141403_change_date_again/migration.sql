/*
  Warnings:

  - The `spotifyTokenExpiresAt` column on the `Host` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Host" DROP COLUMN "spotifyTokenExpiresAt",
ADD COLUMN     "spotifyTokenExpiresAt" TIMESTAMP(3);
