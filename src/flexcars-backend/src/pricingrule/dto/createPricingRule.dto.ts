import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum DurationType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export enum PricingType {
  RENTAL = 'RENTAL',
  ACCIDENT = 'ACCIDENT',
  LATER_PENALTY = 'LATER_PENALTY'
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

  @ApiPropertyOptional({ enum: PricingType, default: PricingType.RENTAL })
  @IsOptional()
  @IsString()
  type?: PricingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dynamicMultiplier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  season?: string;
}
