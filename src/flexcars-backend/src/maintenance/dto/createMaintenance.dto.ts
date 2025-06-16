import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumber, IsBoolean } from 'class-validator';

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
  @ApiProperty({
    description: 'ID of the vehicle associated with the maintenance',
    example: 'vehicle-1234-uuid',
  })
  @IsString()
  @Type(() => String)
  vehicleId: string;

  @ApiPropertyOptional({
    description: 'Type of maintenance to be performed',
    enum: MaintenanceType,
    example: MaintenanceType.INSPECTION,
  })
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @ApiPropertyOptional({
    description: 'Scheduled date for the maintenance (ISO format)',
    default: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    description: 'Mileage at which the alert should be triggered',
    example: 15000,
  })
  @IsNumber()
  mileageTrigger: number;  

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;


  @ApiPropertyOptional({
    description: 'Date when the maintenance was completed (ISO format)',
    default: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiPropertyOptional({
    description: 'Current status of the maintenance',
    enum: MaintenanceStatus,
    example: MaintenanceStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({
    description: 'Additional notes or comments about the maintenance',
    example: 'Changed oil and checked tire pressure.',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  notes?: string;
}
