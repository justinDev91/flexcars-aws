
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreatePricingRuleDto } from './dto/createPricingRule.dto';
import { UpdatePricingRuleDto } from './dto/updatePricingRule.dto';
import { PricingRuleService } from './pricing.rule.service';

@ApiBearerAuth('access-token') 
@Controller('pricing-rules')
export class PricingRuleController {
  constructor(private readonly pricingRuleService: PricingRuleService) {}

  @Get()
  findAll() {
    return this.pricingRuleService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.pricingRuleService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePricingRuleDto) {
    return this.pricingRuleService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePricingRuleDto) {
    return this.pricingRuleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pricingRuleService.delete(id);
  }
}
