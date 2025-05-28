import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { UpdateInvoiceDto } from './dto/updateInvoice.dto';
import { Invoice } from '@prisma/client';
import { InvoiceService } from './invoice.service';

@ApiBearerAuth('access-token') 
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll(): Promise<Invoice[]> {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string): Promise<Invoice> {
    return this.invoiceService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateInvoiceDto): Promise<Invoice> {
    return this.invoiceService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateInvoiceDto): Promise<Invoice> {
    return this.invoiceService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.invoiceService.delete(id);
  }
}
