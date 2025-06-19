
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService, 
    PrismaService, 
    ReservationService,
    PricingRuleService
  ],
})
export class PaymentModule {}
