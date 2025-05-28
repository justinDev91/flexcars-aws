import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateReservationServiceDto {
  @ApiProperty()
  @IsString()
  reservationId: string;

  @ApiProperty()
  @IsString()
  serviceId: string;
}
