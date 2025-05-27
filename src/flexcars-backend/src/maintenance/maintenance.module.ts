import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VehicleMaintenanceController } from './maintenance.controller';
import { VehicleMaintenanceService } from './maintenance.service';

@Module({
  imports: [],
  controllers: [VehicleMaintenanceController],
  providers: [VehicleMaintenanceService, PrismaService],
  exports: [VehicleMaintenanceService],
})
export class MaintenancesModule {}
