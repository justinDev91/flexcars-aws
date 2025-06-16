import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

export enum AlertType {
  UPCOMING = 'UPCOMING',
  OVERDUE = 'OVERDUE',
  MILEAGE = 'MILEAGE',
}

export class UpdateMaintenanceAlertDto {
  @ApiPropertyOptional({
    description: 'Updated alert date (ISO format)',
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  alertDate?: string;

  @ApiPropertyOptional({
    description: 'Updated type of alert',
    enum: AlertType,
    example: AlertType.MILEAGE,
  })
  @IsOptional()
  @IsEnum(AlertType)
  alertType?: AlertType;

  @ApiPropertyOptional({
    description: 'Updated alert message',
    example: 'Maintenance overdue by 200 km.',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  message?: string;
  
  @ApiPropertyOptional({
    description: 'Whether the alert has been resolved',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}
