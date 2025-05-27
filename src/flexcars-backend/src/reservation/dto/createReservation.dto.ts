import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: 'Start datetime (ISO format)', default: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  startDatetime?: string = new Date().toISOString();

  @ApiPropertyOptional({ description: 'End datetime (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
