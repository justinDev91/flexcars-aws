/*
  Warnings:

  - You are about to drop the `MaintenanceAlerts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaintenanceAlerts" DROP CONSTRAINT "MaintenanceAlerts_maintenanceId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceAlerts" DROP CONSTRAINT "MaintenanceAlerts_vehicleId_fkey";

-- DropTable
DROP TABLE "MaintenanceAlerts";
