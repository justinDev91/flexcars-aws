import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ReservationStatus, Location } from './createReservation.dto';

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
    enum: Location,
    example: Location.SAINT_DENIS,
  })
  @IsOptional()
  @IsEnum(Location)
  pickupLocation?: Location;

  @ApiPropertyOptional({
    description: 'Updated dropoff location for the reservation',
    enum: Location,
    example: Location.ISSY_LES_MOULINEAUX,
  })
  @IsOptional()
  @IsEnum(Location)
  dropoffLocation?: Location;

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

  @ApiPropertyOptional({
    description: 'Updated car sitting option',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  carSittingOption?: boolean;
}
