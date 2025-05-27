import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VehiclesController } from './vehicle.controller';
import { VehiclesService } from './vehicle.service';

@Module({
  imports: [],
  controllers: [VehiclesController],
  providers: [VehiclesService, PrismaService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
