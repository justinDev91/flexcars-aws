import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  INCIDENT = 'INCIDENT',
}

export class CreateVehicleDto {

  @ApiPropertyOptional({ description: 'CompanyId of the vehicle', example: 'Ijdond783' })
  @IsOptional()
  @Type(() => String)
  companyId: string

  @ApiProperty({ description: 'Brand of the vehicle', example: 'Toyota' })
  @IsString()
  @Type(() => String)
  brand: string;

  @ApiProperty({ description: 'Model of the vehicle', example: 'Corolla' })
  @IsString()
  @Type(() => String)
  model: string;

  @ApiProperty({ description: 'Year of manufacture', example: 2020 })
  @IsNumber()
  @Type(() => Number)
  year: number;

  @ApiProperty({ description: 'License plate number', example: 'ABC1234' })
  @IsString()
  @Type(() => String)
  plateNumber: string;

  @ApiProperty({ enum: FuelType, description: 'Type of fuel used', example: FuelType.PETROL })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ description: 'Current mileage of the vehicle', example: 15000 })
  @IsNumber()
  @Type(() => Number)
  currentMileage: number;

  @ApiProperty({ description: 'Whether the vehicle has GPS enabled', example: true })
  @IsOptional()
  @Type(() => Boolean)
  gpsEnabled?: boolean;

  @ApiProperty({ enum: VehicleStatus, description: 'Current status of the vehicle', example: VehicleStatus.AVAILABLE })
  @IsEnum(VehicleStatus)
  status: VehicleStatus;

  @ApiPropertyOptional({ description: 'Latitude of the vehicle location', example: 41.3851 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  locationLat?: number;

  @ApiPropertyOptional({ description: 'Longitude of the vehicle location', example: 2.1734 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  locationLng?: number;

  @ApiPropertyOptional({ description: 'URL to the vehicle image', example: 'https://cdn.example.com/vehicles/toyota-corolla.png' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  imageUrl?: string;
}