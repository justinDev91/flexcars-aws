import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  password: string;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  lastName: string;
}
