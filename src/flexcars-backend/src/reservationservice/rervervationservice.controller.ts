
import { Controller, Get, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReservationServiceService } from './reservationservice.service';


@ApiBearerAuth('access-token') 
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
