
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateVehicleRecommendationDto {
  @ApiPropertyOptional({ description: 'Updated score of the recommendation' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: 'Updated reason for the recommendation' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Updated datetime when the recommendation was created' })
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
