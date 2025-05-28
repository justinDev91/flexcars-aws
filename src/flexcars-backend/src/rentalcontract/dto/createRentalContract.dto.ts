import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateRentalContractDto {
  @ApiProperty({ description: 'ID of the reservation', example: 'reservation-uuid' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'ID of the customer who signed', example: 'user-uuid' })
  @IsString()
  signedByCustomerId: string;

  @ApiProperty({ description: 'ID of the agent who signed', example: 'agent-uuid' })
  @IsString()
  signedByAgentId: string;

  @ApiPropertyOptional({ description: 'URL to the signed PDF', example: 'https://example.com/contract.pdf' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Datetime when the contract was signed', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  signedAt?: string;
}
