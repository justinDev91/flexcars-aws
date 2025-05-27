import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CompanyType } from './createOrUpdateCompany';

export class Company {
  @ApiProperty({
    description: 'Filter by company name (partial match)',
    example: 'AutoRent',
  })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    enum: CompanyType,
    description:
      'Filter by company type (e.g., DEALERSHIP, RENTAL_AGENCY, BUSINESS)',
    example: CompanyType.RENTAL_AGENCY,
  })
  @IsEnum(CompanyType)
  type: CompanyType;

  @ApiPropertyOptional({
    description: 'Filter by address (partial match)',
    example: '123 Main Street, Barcelona',
  })
  @IsString()
  @Type(() => String)
  address: string;

  @ApiPropertyOptional({
    description: 'Filter by VAT number',
    example: 'ESB12345678',
  })
  @IsString()
  @Type(() => String)
  vatNumber: string;

  @ApiPropertyOptional({
    description: 'Filter by logo URL (partial match)',
    example: 'https://cdn.example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  logoUrl?: string;
}
