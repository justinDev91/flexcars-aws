import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from 'src/prisma.service';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';
import { VehiclesService } from 'src/vehicle/vehicle.service';

@Module({
  controllers: [ReservationController],
  providers: [
    ReservationService,
    PrismaService,
    PricingRuleService,
    VehiclesService
  ],
  exports: [ReservationService],
})
export class ReservationsModule {}
