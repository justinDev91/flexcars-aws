
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePaymentDto, PaymentStatus } from './dto/createPayment.dto';
import { InvoiceStatus } from 'src/invoice/dto/createInvoice.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.payment.findMany();
  }

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

 async create(data: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid or not eligible for payment');
    }

    const payment = await this.prisma.payment.create({ data });

    if(payment.status === PaymentStatus.SUCCESS) {
        await this.prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: InvoiceStatus.PAID },
        });
    }
    return payment;
  }


  update(id: string, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }
}
