import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Registered email address of the user.',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: 'Password associated with the user account.',
    example: 'MySecureP@ss123',
  })
  @IsString()
  @Type(() => String)
  password: string;
}
