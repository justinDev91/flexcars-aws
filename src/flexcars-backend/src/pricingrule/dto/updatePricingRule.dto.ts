import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { DurationType } from './createPricingRule.dto';

export class UpdatePricingRuleDto {
  @ApiPropertyOptional({ enum: DurationType })
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
