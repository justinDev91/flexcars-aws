
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'Updated type of notification', enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Updated title of the notification' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated message of the notification' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Updated datetime when the notification was sent' })
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiPropertyOptional({ description: 'Updated read status of the notification' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
