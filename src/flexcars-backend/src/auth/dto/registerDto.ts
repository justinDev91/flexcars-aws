import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address. Must be a valid email format.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: 'User password. Must be at least 12 characters, including uppercase, lowercase, numbers, and symbols.',
    example: 'Str0ngP@ssw0rd!',
  })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'Password must include uppercase, lowercase, number, and special character.',
  })
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
