
import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateReservationServiceDto } from './dto/createReservationService.dto';
import { ReservationServiceService } from './reservationservice.service';

@ApiTags('reservation-services')
@Controller('reservation-services')
export class ReservationServiceController {
  constructor(private readonly reservationServiceService: ReservationServiceService) {}

  @Get()
  findAll() {
    return this.reservationServiceService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reservationServiceService.findById(id);
  }

  // @Post()
  // create(@Body() data: CreateReservationServiceDto) {
  //   return this.reservationServiceService.create(data);
  // }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reservationServiceService.delete(id);
  }
}
