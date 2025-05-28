
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID of the user', example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Type of notification', enum: NotificationType, example: NotificationType.EMAIL })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Title of the notification', example: 'Your reservation is confirmed' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Message of the notification', example: 'Your reservation for vehicle XYZ is confirmed.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Datetime when the notification was sent', example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiPropertyOptional({ description: 'Read status of the notification', example: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
