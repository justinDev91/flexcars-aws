/*
  Warnings:

  - The `pickupLocation` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dropoffLocation` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Location" AS ENUM ('PARIS_11', 'PARIS_19', 'ISSY_LES_MOULINEAUX', 'BOULOGNE', 'SAINT_DENIS');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "carSittingOption" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "pickupLocation",
ADD COLUMN     "pickupLocation" "Location" DEFAULT 'SAINT_DENIS',
DROP COLUMN "dropoffLocation",
ADD COLUMN     "dropoffLocation" "Location" DEFAULT 'ISSY_LES_MOULINEAUX';
