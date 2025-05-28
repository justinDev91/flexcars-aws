
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Availability } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class UpdateCarSitterDto {
  @ApiPropertyOptional({ description: 'Updated ID of the assigned vehicle' })
  @IsOptional()
  @IsString()
  assignedVehicleId?: string;

  @ApiPropertyOptional({ description: 'Updated current latitude of the car sitter' })
  @IsOptional()
  @IsNumber()
  currentLocationLat?: number;

  @ApiPropertyOptional({ description: 'Updated current longitude of the car sitter' })
  @IsOptional()
  @IsNumber()
  currentLocationLng?: number;

  @ApiPropertyOptional({ description: 'Updated availability status of the car sitter', enum: Availability })
  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @ApiPropertyOptional({ description: 'Updated datetime when the car sitter was last active' })
  @IsOptional()
  @IsDateString()
  lastActiveAt?: string;
}
