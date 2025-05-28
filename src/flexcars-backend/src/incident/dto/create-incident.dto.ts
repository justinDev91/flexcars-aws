
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';


export class CreateIncidentDto {
  @ApiProperty({ description: 'ID of the vehicle', example: 'vehicle-uuid' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ description: 'ID of the user who reported the incident', example: 'user-uuid' })
  @IsString()
  reportedById: string;

  @ApiPropertyOptional({ description: 'Description of the incident', example: 'Scratch on the left door' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Severity of the incident', enum: IncidentSeverity, example: IncidentSeverity.MEDIUM })
  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @ApiPropertyOptional({ description: 'URL to photos of the incident', example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  photosUrl?: string;

  @ApiPropertyOptional({ description: 'Status of the incident', enum: IncidentStatus, example: IncidentStatus.OPEN })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({ description: 'Datetime when the incident was reported', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  reportedAt?: string;

  @ApiPropertyOptional({ description: 'Datetime when the incident was resolved', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  resolvedAt?: string;
}
