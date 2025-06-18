import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum Location {
  PARIS_11 = 'PARIS_11',
  PARIS_19 = 'PARIS_19',
  ISSY_LES_MOULINEAUX = 'ISSY_LES_MOULINEAUX',
  BOULOGNE = 'BOULOGNE',
  SAINT_DENIS = 'SAINT_DENIS',
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
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  startDatetime?: string;

  @ApiPropertyOptional({
    description: 'End datetime of the reservation in ISO format (20 days from now)',
    example: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  })
  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @ApiPropertyOptional({
    description: 'Location where the vehicle will be picked up',
    enum: Location,
    example: Location.SAINT_DENIS,
  })
  @IsOptional()
  @IsEnum(Location)
  pickupLocation?: Location;

  @ApiPropertyOptional({
    description: 'Location where the vehicle will be dropped off',
    enum: Location,
    example: Location.ISSY_LES_MOULINEAUX,
  })
  @IsOptional()
  @IsEnum(Location)
  dropoffLocation?: Location;

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

  @ApiPropertyOptional({
    description: 'Whether car sitting option is selected',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  carSittingOption?: boolean;
}
