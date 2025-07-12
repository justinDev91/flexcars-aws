-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');

-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'PICKED_UP';

-- CreateTable
CREATE TABLE "PickupRequest" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "carSitterId" TEXT,
    "requestedTime" TIMESTAMP(3) NOT NULL,
    "pickupLocation" "Location" NOT NULL,
    "status" "PickupStatus" NOT NULL DEFAULT 'PENDING',
    "carSitterNotes" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_carSitterId_fkey" FOREIGN KEY ("carSitterId") REFERENCES "CarSitter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
