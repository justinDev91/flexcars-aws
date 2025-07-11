-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_reservationId_fkey";

-- DropIndex
DROP INDEX "Invoice_reservationId_key";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoiceType" TEXT DEFAULT 'RESERVATION',
ALTER COLUMN "reservationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
