-- DropIndex
DROP INDEX "public"."Guest_rsvpStatus_key";

-- AlterTable
ALTER TABLE "Guest" ALTER COLUMN "rsvpStatus" SET DEFAULT 'PENDING';
