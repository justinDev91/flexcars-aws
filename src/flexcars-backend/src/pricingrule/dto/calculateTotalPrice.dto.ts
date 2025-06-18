import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsISO8601 } from 'class-validator';

export class CalculateTotalPriceDto {
  @ApiProperty({
    example: 'vehicle-123',
    description: 'The ID of the vehicle to calculate pricing for',
  })
  @IsString()
  vehicleId: string;

  @ApiProperty({
    example: '2025-06-20T10:00:00Z',
    description: 'ISO 8601 start datetime of the reservation',
  })
  @IsISO8601()
  startDate: string;

  @ApiProperty({
    example: '2025-06-22T10:00:00Z',
    description: 'ISO 8601 end datetime of the reservation',
  })
  @IsISO8601()
  endDate: string;
}
