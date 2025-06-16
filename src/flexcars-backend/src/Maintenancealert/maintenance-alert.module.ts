import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MaintenanceAlertController } from './maintenance-alert.controller';
import { MaintenanceAlertService } from './maintenance-alert.service';

@Module({
  imports: [],
  controllers: [MaintenanceAlertController],
  providers: [MaintenanceAlertService, PrismaService],
  exports: [MaintenanceAlertService],
})
export class MaintenanceAlertModule {}
