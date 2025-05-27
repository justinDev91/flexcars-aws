import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CUSTOMER = 'CUSTOMER',
  CARSITTER = 'CARSITTER',
}

export class CreateOrUpdateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiPropertyOptional({ description: 'User password (optional for updates)' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  password: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  @Type(() => String)
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  @Type(() => String)
  lastName: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional()
  @Type(() => String)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Birth date of the user (ISO format)',
    example: '2001-05-27T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'ID of the company the user belongs to (if applicable)',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  companyId?: string;
}
