
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateVehicleRecommendationDto {
  @ApiProperty({ description: 'ID of the user', example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID of the recommended vehicle', example: 'vehicle-uuid' })
  @IsString()
  recommendedVehicleId: string;

  @ApiPropertyOptional({ description: 'Score of the recommendation', example: 4.5 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: 'Reason for the recommendation', example: 'Based on your previous rentals' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Datetime when the recommendation was created', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
