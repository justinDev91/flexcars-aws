import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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

export class UpdateMaintenanceDto {

  @ApiPropertyOptional({ enum: MaintenanceType, description: 'Type of maintenance' })
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @ApiPropertyOptional({ description: 'Scheduled date (ISO format)' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Completed date (ISO format)' })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

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
