import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address. Must be a valid email format.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: 'User password. Should be at least 6 characters.',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @Type(() => String)
  password: string;

  @ApiProperty({
    description: 'User\'s first name.',
    example: 'John',
  })
  @IsString()
  @Type(() => String)
  firstName: string;

  @ApiProperty({
    description: 'User\'s last name.',
    example: 'Doe',
  })
  @IsString()
  @Type(() => String)
  lastName: string;
}
