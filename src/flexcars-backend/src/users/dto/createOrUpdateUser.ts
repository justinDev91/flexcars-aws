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
  @ApiProperty({
    description: 'User email address',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiPropertyOptional({
    description: 'User password (required for creation, optional for updates)',
    example: 'StrongP@ssw0rd!',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Jane',
  })
  @IsString()
  @Type(() => String)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @Type(() => String)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+33 6 12 34 56 78',
  })
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
    description: 'User avatar from mantine (if applicable)',
    example: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
  })  
  @IsString()
  avatar?: string;
  
  @ApiPropertyOptional({
    description: 'ID of the company the user belongs to (if applicable)',
    example: 'company-uuid-1234',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  companyId?: string;
}
