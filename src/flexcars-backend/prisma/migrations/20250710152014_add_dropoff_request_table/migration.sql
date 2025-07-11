-- CreateEnum
CREATE TYPE "DropoffStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');

-- CreateTable
CREATE TABLE "DropoffRequest" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "carSitterId" TEXT,
    "currentMileage" INTEGER NOT NULL,
    "dropoffTime" TIMESTAMP(3) NOT NULL,
    "hasAccident" BOOLEAN NOT NULL DEFAULT false,
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLng" DOUBLE PRECISION NOT NULL,
    "signature" TEXT,
    "status" "DropoffStatus" NOT NULL DEFAULT 'PENDING',
    "penaltyAmount" DOUBLE PRECISION DEFAULT 0,
    "penaltyInvoiceId" TEXT,
    "carSitterNotes" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DropoffRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DropoffRequest" ADD CONSTRAINT "DropoffRequest_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropoffRequest" ADD CONSTRAINT "DropoffRequest_carSitterId_fkey" FOREIGN KEY ("carSitterId") REFERENCES "CarSitter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
