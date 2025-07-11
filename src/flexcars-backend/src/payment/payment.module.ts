
import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { ReservationModule } from '../reservation/reservation.module';
import { PricingRuleService } from '../pricingrule/pricing.rule.service';

@Module({
  imports: [forwardRef(() => ReservationModule)],
  controllers: [PaymentController],
  providers: [
    PaymentService, 
    StripeService,
    PrismaService, 
    PricingRuleService,
  ],
  exports: [StripeService, PaymentService],
})
export class PaymentModule {}
