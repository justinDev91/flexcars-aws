import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject } from 'class-validator';

export class StripeWebhookDto {
  @ApiProperty({ description: 'Type of Stripe event' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Event data from Stripe' })
  @IsObject()
  data: any;

  @ApiProperty({ description: 'Stripe event ID' })
  @IsString()
  id: string;
} 