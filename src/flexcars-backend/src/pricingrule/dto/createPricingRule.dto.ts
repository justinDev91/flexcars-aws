import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum DurationType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export class CreatePricingRuleDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiPropertyOptional({ enum: DurationType, default: DurationType.HOURLY })
  @IsOptional()
  @IsEnum(DurationType)
  durationType?: DurationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dynamicMultiplier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  season?: string;
}
