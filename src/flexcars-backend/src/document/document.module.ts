import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PrismaService } from 'src/prisma.service';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';
import { InvoiceService } from 'src/invoice/invoice.service';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService, 
    PrismaService,
    PricingRuleService,
    InvoiceService
  ],
})
export class DocumentModule {}
