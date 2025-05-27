import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ReservationStatus } from './createReservation.dto';

export class UpdateReservationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDatetime?: string;

  @ApiPropertyOptional()
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
