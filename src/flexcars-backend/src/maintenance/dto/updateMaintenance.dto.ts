import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

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
  @ApiPropertyOptional({
    description: 'Type of maintenance to update',
    enum: MaintenanceType,
    example: MaintenanceType.REPAIR,
  })
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @ApiPropertyOptional({
    description: 'Updated scheduled date for the maintenance (ISO format)',
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({
    description: 'Updated completed date for the maintenance (ISO format)',
    default: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiPropertyOptional({
    description: 'Updated status of the maintenance',
    enum: MaintenanceStatus,
    example: MaintenanceStatus.DONE,
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;
      
  @ApiPropertyOptional({
    description: 'Updated notes or comments about the maintenance',
    example: 'Brake pads replaced and system tested.',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  notes?: string;
}
