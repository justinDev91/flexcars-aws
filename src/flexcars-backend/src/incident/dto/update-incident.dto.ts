import { ApiPropertyOptional } from '@nestjs/swagger';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ description: 'Updated description of the incident' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Updated severity of the incident', enum: IncidentSeverity })
  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @ApiPropertyOptional({ description: 'Updated URL to photos of the incident' })
  @IsOptional()
  @IsString()
  photosUrl?: string;

  @ApiPropertyOptional({ description: 'Updated status of the incident', enum: IncidentStatus })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({ description: 'Updated datetime when the incident was reported' })
  @IsOptional()
  @IsDateString()
  reportedAt?: string;

  @ApiPropertyOptional({ description: 'Updated datetime when the incident was resolved' })
  @IsOptional()
  @IsDateString()
  resolvedAt?: string;

  @ApiPropertyOptional({ description: 'Updated location of the incident' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Updated reservation ID associated with the incident' })
  @IsOptional()
  @IsString()
  reservationId?: string;
}
