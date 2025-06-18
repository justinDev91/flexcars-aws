import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';
import { CreateDocumentDto } from './dto/createDocument.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { InvoiceStatus } from 'src/invoice/dto/createInvoice.dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingRuleService: PricingRuleService,
    private readonly invoiceService: InvoiceService
  ) {}

  findAll() {
    return this.prisma.document.findMany();
  }

  async findById(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async create(data: CreateDocumentDto) {
    //TODO: Implemente AI documents vérification Model and Change this condition to true
    if (!data.verified) {
      const reservation = await this.prisma.reservation.findFirst({
        where: {
          customerId: data.userId,
          status: 'PENDING',
        },
      });
      if (
        reservation &&
        reservation.startDatetime &&
        reservation.endDatetime
      ) {
        const amount = await this.pricingRuleService.calculateTotalPrice(
          reservation.vehicleId,
          reservation.startDatetime.toISOString(),
          reservation.endDatetime.toISOString()
        );

        const invoice = await this.invoiceService.create({
          reservationId: reservation.id,
          amount,
          status: InvoiceStatus.UNPAID,
          dueDate: new Date().toISOString(),
        });
      }
    }

    return this.prisma.document.create({ data });
  }


  update(id: string, data: Prisma.DocumentUpdateInput) {
    return this.prisma.document.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
