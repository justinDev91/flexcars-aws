/*
  Warnings:

  - Made the column `maintenanceId` on table `MaintenanceAlert` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MaintenanceAlert" DROP CONSTRAINT "MaintenanceAlert_maintenanceId_fkey";

-- AlterTable
ALTER TABLE "MaintenanceAlert" ALTER COLUMN "maintenanceId" SET NOT NULL,
ALTER COLUMN "alertType" SET DEFAULT 'UPCOMING';

-- AddForeignKey
ALTER TABLE "MaintenanceAlert" ADD CONSTRAINT "MaintenanceAlert_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "VehicleMaintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
