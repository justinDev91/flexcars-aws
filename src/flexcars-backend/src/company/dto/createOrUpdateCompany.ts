import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';

export enum CompanyType {
  DEALERSHIP = 'DEALERSHIP',
  RENTAL_AGENCY = 'RENTAL_AGENCY',
  BUSINESS = 'BUSINESS',
}

export class CreateOrUpdateCompanyDto {
  @ApiProperty({
    description: 'The official name of the company',
    example: 'AutoRent Barcelona',
  })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    enum: CompanyType,
    description:
      'The type of company (e.g., dealership, rental agency, or business)',
    example: CompanyType.RENTAL_AGENCY,
  })
  @IsEnum(CompanyType)
  type: CompanyType;

  @ApiProperty({
    description: 'The physical address of the company',
    example: 'Carrer de la Marina, 123, 08013 Barcelona, Spain',
  })
  @IsString()
  @Type(() => String)
  address: string;

  @ApiProperty({
    description: 'The VAT number used for tax identification',
    example: 'ESB12345678',
  })
  @IsString()
  @Type(() => String)
  vatNumber: string;

  @ApiProperty({
    description: 'URL to the company’s logo image',
    example: 'https://cdn.example.com/logos/autorent.png',
  })
  @IsString()
  @Type(() => String)
  logoUrl: string;
}
