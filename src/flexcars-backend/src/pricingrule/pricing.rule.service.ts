
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

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
