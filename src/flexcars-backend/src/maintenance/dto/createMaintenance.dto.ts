import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export enum MaintenanceType {
  OIL_CHANGE = 'OIL_CHANGE',
  INSPECTION = 'INSPECTION',
  REPAIR = 'REPAIR',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
  OVERDUE = 'OVERDUE',
}

export class CreateMaintenanceDto {
  @ApiProperty({ description: 'ID of the vehicle' })
  @IsString()
  @Type(() => String)
  vehicleId: string;

  @ApiPropertyOptional({ enum: MaintenanceType, description: 'Type of maintenance' })
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  
  @ApiPropertyOptional({ description: 'Scheduled date (ISO format) : 2025-05-27T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Completed date (ISO format) : 2025-05-27T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedDate?: string ;


  @ApiPropertyOptional({ enum: MaintenanceStatus, description: 'Status of maintenance' })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  notes?: string;
}
