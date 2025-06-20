import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VehiclesController } from './vehicle.controller';
import { VehiclesService } from './vehicle.service';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';

@Module({
  imports: [],
  controllers: [VehiclesController],
  providers: [VehiclesService, PrismaService, PricingRuleService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
