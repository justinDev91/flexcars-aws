import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateRentalContractDto {
  @ApiPropertyOptional({ description: 'Updated PDF URL', example: 'https://example.com/updated-contract.pdf' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Updated signing datetime', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  signedAt?: string;
}
