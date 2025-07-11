-- CreateTable
CREATE TABLE "MaintenanceAlerts" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "maintenanceId" TEXT NOT NULL,
    "alertDate" TIMESTAMP(3) NOT NULL,
    "alertType" "AlertType" NOT NULL DEFAULT 'UPCOMING',
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceAlerts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintenanceAlerts" ADD CONSTRAINT "MaintenanceAlerts_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAlerts" ADD CONSTRAINT "MaintenanceAlerts_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "VehicleMaintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
