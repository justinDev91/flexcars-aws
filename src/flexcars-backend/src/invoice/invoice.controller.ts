import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { UpdateInvoiceDto } from './dto/updateInvoice.dto';
import { Invoice } from '@prisma/client';
import { InvoiceService } from './invoice.service';

@ApiBearerAuth('access-token') 
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  async findAll(@Query('userId') userId?: string): Promise<Invoice[]> {
    return this.invoiceService.findAll(userId);
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

  @Get(':id/download')
  @ApiParam({ name: 'id' })
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.invoiceService.generateInvoicePDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${id}.pdf`);
    res.send(pdfBuffer);
  }

  @Get(':id/view')
  @ApiParam({ name: 'id' })
  async viewInvoice(@Param('id') id: string, @Res() res: Response) {
    const html = await this.invoiceService.generateInvoiceHTML(id);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.invoiceService.delete(id);
  }
}
