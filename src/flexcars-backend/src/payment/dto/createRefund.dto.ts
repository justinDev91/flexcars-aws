import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum RefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
}

export class CreateRefundDto {
  @ApiProperty({ description: 'ID of the payment to refund' })
  @IsString()
  paymentId: string;

  @ApiProperty({ description: 'ID of the reservation being cancelled' })
  @IsString()
  reservationId: string;

  @ApiPropertyOptional({ description: 'Amount to refund (if partial). Leave empty for full refund' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ enum: RefundReason, default: RefundReason.REQUESTED_BY_CUSTOMER })
  @IsOptional()
  @IsEnum(RefundReason)
  reason?: RefundReason;
}

// Nouveau DTO pour les remboursements par facture (plus pratique pour l'API frontend)
export class CreateRefundByInvoiceDto {
  @ApiProperty({ description: 'ID of the invoice to refund' })
  @IsString()
  invoiceId: string;

  @ApiPropertyOptional({ description: 'Amount to refund (if partial). Leave empty for full refund' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ enum: RefundReason, default: RefundReason.REQUESTED_BY_CUSTOMER })
  @IsOptional()
  @IsEnum(RefundReason)
  reason?: RefundReason;
} 