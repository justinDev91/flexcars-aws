
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';

export enum Availability {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
}

export class CreateCarSitterDto {
  @ApiProperty({ description: 'ID of the user', example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'ID of the assigned vehicle', example: 'vehicle-uuid' })
  @IsOptional()
  @IsString()
  assignedVehicleId?: string;

  @ApiPropertyOptional({ description: 'Current latitude of the car sitter', example: 48.8566 })
  @IsOptional()
  @IsNumber()
  currentLocationLat?: number;

  @ApiPropertyOptional({ description: 'Current longitude of the car sitter', example: 2.3522 })
  @IsOptional()
  @IsNumber()
  currentLocationLng?: number;

  @ApiPropertyOptional({ description: 'Availability status of the car sitter', enum: Availability, example: Availability.BUSY })
  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @ApiPropertyOptional({ description: 'Datetime when the car sitter was last active', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  lastActiveAt?: string;
}
