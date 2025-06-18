import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { InvoiceStatus } from './createInvoice.dto';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Updated amount', example: 599.99 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Updated due date', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Updated payment date', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ description: 'Updated status', enum: InvoiceStatus, example: InvoiceStatus.PAID })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Updated penalty amount', example: 75.0 })
  @IsOptional()
  @IsNumber()
  penaltyAmount?: number;
}
