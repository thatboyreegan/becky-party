-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "uniqueToken" TEXT NOT NULL,
    "rsvpStatus" TEXT NOT NULL,
    "qrCodePath" TEXT,
    "pictureCount" INTEGER NOT NULL DEFAULT 0,
    "deviceToken" TEXT,
    "validatedAtVenue" BOOLEAN NOT NULL DEFAULT false,
    "creeatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_phoneNumber_key" ON "Guest"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_uniqueToken_key" ON "Guest"("uniqueToken");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_rsvpStatus_key" ON "Guest"("rsvpStatus");
