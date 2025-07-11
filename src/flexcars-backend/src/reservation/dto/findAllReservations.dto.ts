import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindAllReservationsDto {
  @ApiProperty({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ default: 10 })
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty({ required: false, description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false, description: 'Filter by vehicle ID' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ required: false, description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, description: 'Filter from start date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Filter to end date' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
