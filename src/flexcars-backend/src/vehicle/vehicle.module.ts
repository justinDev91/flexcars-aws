import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VehiclesController } from './vehicle.controller';
import { VehiclesService } from './vehicle.service';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [MailerModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, PrismaService, PricingRuleService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
