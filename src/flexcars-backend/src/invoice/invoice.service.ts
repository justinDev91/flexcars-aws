import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Invoice } from '@prisma/client';
import { CreateInvoiceDto } from './dto/createInvoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Invoice[]> {
    return this.prisma.invoice.findMany();
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(data: CreateInvoiceDto): Promise<Invoice> {
    return this.prisma.invoice.create({ data });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invoice.delete({ where: { id } });
  }
}
