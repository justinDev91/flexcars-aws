import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
} from 'class-validator';


export class UpdateUserDto {
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
    description: 'User avatar from mantine (if applicable)',
    example: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
  })  
  @IsString()
  avatar?: string;
}
