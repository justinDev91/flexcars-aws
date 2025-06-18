import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';

export enum InvoiceStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OVERDUE = 'OVERDUE',
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'ID of the reservation', example: 'reservation-uuid' })
  @IsString()
  reservationId: string;

  @ApiPropertyOptional({ description: 'Total amount of the invoice', example: 499.99 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Due date of the invoice', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Date when the invoice was paid', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ description: 'Status of the invoice', enum: InvoiceStatus, example: InvoiceStatus.UNPAID })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Penalty amount if overdue', example: 50.0 })
  @IsOptional()
  @IsNumber()
  penaltyAmount?: number;
}
