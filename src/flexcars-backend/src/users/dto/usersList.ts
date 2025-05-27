import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class FindAllUsersDto {
  @ApiProperty({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ default: 10 })
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;
}
