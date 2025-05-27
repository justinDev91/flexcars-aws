import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID of the vehicle being reserved',
    example: 'vehicle-1234-uuid',
  })
  @IsString()
  vehicleId: string;

  @ApiProperty({
    description: 'ID of the customer making the reservation',
    example: 'user-5678-uuid',
  })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ 
    description: 'Start datetime of the reservation in ISO format',
    default: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  startDatetime?: string = new Date().toISOString();

  @ApiPropertyOptional({ 
    description: 'End datetime of the reservation in ISO format (20 days from now)',
    default: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  })
  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @ApiPropertyOptional({
    description: 'Location where the vehicle will be picked up',
    example: '123 Main Street, Paris',
  })
  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @ApiPropertyOptional({
    description: 'Location where the vehicle will be dropped off',
    example: '456 Avenue de la République, Paris',
  })
  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @ApiPropertyOptional({
    description: 'Current status of the reservation',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Total price of the reservation in euros',
    example: 299.99,
  })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
