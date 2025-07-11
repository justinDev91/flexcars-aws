import { Module, forwardRef } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma.service';
import { PricingRuleService } from '../pricingrule/pricing.rule.service';
import { PaymentModule } from '../payment/payment.module';
import { VehiclesService } from '../vehicle/vehicle.service';

@Module({
  imports: [forwardRef(() => PaymentModule)],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    PrismaService,
    PricingRuleService,
    VehiclesService,
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
