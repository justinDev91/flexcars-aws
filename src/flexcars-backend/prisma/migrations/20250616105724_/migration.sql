/*
  Warnings:

  - You are about to drop the `MaintenanceAlert` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaintenanceAlert" DROP CONSTRAINT "MaintenanceAlert_maintenanceId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceAlert" DROP CONSTRAINT "MaintenanceAlert_vehicleId_fkey";

-- DropTable
DROP TABLE "MaintenanceAlert";
