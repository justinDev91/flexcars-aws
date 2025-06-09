-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
