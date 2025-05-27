import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ReservationStatus } from './createReservation.dto';

export class UpdateReservationDto {
  @ApiPropertyOptional({
    description: 'Updated start datetime of the reservation (ISO format)',
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  startDatetime?: string;

  @ApiPropertyOptional({
    description: 'Updated end datetime of the reservation (ISO format)',
    example: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })
  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @ApiPropertyOptional({
    description: 'Updated pickup location for the reservation',
    example: '123 Main Street, Paris',
  })
  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @ApiPropertyOptional({
    description: 'Updated dropoff location for the reservation',
    example: '456 Avenue de la République, Paris',
  })
  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @ApiPropertyOptional({
    description: 'Updated status of the reservation',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Updated total price of the reservation in euros',
    example: 349.99,
  })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
