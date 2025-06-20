import { ApiProperty } from '@nestjs/swagger';
import {IsNumber, IsString } from 'class-validator';

export class DropVehicleDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'resv-1234-uuid' })
  @IsString()
  reservationId: string;

  @ApiProperty({ example: 45200 })
  @IsNumber()
  currentMileage: number;
}
