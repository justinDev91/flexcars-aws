/*
  Warnings:

  - You are about to drop the column `locationId` on the `Incident` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Incident" DROP CONSTRAINT "Incident_locationId_fkey";

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "locationId",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "reservationId" TEXT;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
