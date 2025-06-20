
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { differenceInDays, differenceInHours, differenceInWeeks } from 'date-fns';
import { PricingType } from './dto/createPricingRule.dto';

@Injectable()
export class PricingRuleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pricingRule.findMany();
  }

  async findById(id: string) {
    const pricingRule = await this.prisma.pricingRule.findUnique({ where: { id } });
    if (!pricingRule) throw new NotFoundException('Pricing rule not found');
    return pricingRule;
  }

  async calculateTotalPrice(vehicleId: string, startDate: string, endDate: string): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const pricingRule = await this.prisma.pricingRule.findFirst({
      where: { vehicleId },
    });

    if (!pricingRule) {
      throw new NotFoundException('No pricing rule found for this vehicle');
    }

    let duration = 0;
    switch (pricingRule.durationType) {
      case 'HOURLY':
        duration = differenceInHours(end, start);
        break;
      case 'DAILY':
        duration = differenceInDays(end, start);
        break;
      case 'WEEKLY':
        duration = differenceInWeeks(end, start);
        break;
      default:
        throw new Error('Unsupported duration type');
    }

    const base = pricingRule.basePrice ?? 1;
    const multiplier = pricingRule.dynamicMultiplier && pricingRule.dynamicMultiplier !== 0
      ? pricingRule.dynamicMultiplier
      : 1;
    
    return duration * base * multiplier;
  }

  
  async calculatePenaltyAmount(vehicleId: string, type: PricingType, from: Date, to: Date): Promise<number> {
      const pricingRule = await this.prisma.pricingRule.findFirst({
        where: {
          vehicleId,
          type,
        },
      });

      if (!pricingRule) {
        throw new NotFoundException(`No pricing rule found for type ${type}`);
      }

      let duration = 0;
      switch (pricingRule.durationType) {
        case 'HOURLY':
          duration = differenceInHours(to, from);
          break;
        case 'DAILY':
          duration = differenceInDays(to, from);
          break;
        case 'WEEKLY':
          duration = differenceInWeeks(to, from);
          break;
      }

      const base = pricingRule.basePrice ?? 1;
      const multiplier = pricingRule.dynamicMultiplier && pricingRule.dynamicMultiplier !== 0
        ? pricingRule.dynamicMultiplier
        : 1;

      return duration * base * multiplier;
  }

  create(data: Prisma.PricingRuleCreateInput) {
    return this.prisma.pricingRule.create({ data });
  }

  update(id: string, data: Prisma.PricingRuleUpdateInput) {
    return this.prisma.pricingRule.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.pricingRule.delete({ where: { id } });
  }
}
