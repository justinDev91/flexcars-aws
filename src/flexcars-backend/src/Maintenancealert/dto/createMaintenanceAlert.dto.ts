import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean, IsNumber } from 'class-validator';

export enum AlertType {
  UPCOMING = 'UPCOMING',
  OVERDUE = 'OVERDUE',
  MILEAGE = 'MILEAGE',
}

export class CreateMaintenanceAlertDto {
  @ApiProperty({
    description: 'ID of the vehicle associated with the alert',
    example: 'vehicle-uuid-1234',
  })
  @IsString()
  @Type(() => String)
  vehicleId: string;

  @ApiProperty({
    description: 'ID of the related maintenance record (if applicable)',
    example: 'maintenance-uuid-5678',
  })
  @IsString()
  @Type(() => String)
  maintenanceId: string;

  @ApiProperty({
    description: 'Date when the alert should be triggered (ISO format)',
    example: new Date().toISOString(),
  })
  @IsDateString()
  alertDate: string;

  @ApiProperty({
    description: 'Type of alert',
    enum: AlertType,
    example: AlertType.UPCOMING,
  })
  @IsEnum(AlertType)
  alertType: AlertType;

  @ApiProperty({
    description: 'Message describing the alert',
    example: 'Maintenance due in 3 days or 500 km.',
  })
  @IsString()
  @Type(() => String)
  message: string;

  @ApiPropertyOptional({
    description: 'Whether the alert has been resolved',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}
