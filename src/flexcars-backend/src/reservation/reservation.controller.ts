import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateReservationDto } from './dto/createReservation.dto';
import { UpdateReservationDto } from './dto/updateReservation.dto';
import { FindAllReservationsDto } from './dto/findAllReservations.dto';
import { ReservationService } from './reservation.service';
import { Response } from 'express';
import { Reservation, Vehicle } from '@prisma/client';
import { VehiclesService } from 'src/vehicle/vehicle.service';
import { DropVehicleDto } from './dto/DropVehicle.dto';

@ApiBearerAuth('access-token') 
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly vehicleService: VehiclesService,
  ) {}

  @Get()
  async findAll(@Query() query: FindAllReservationsDto): Promise<Reservation[]> {
    return this.reservationService.findAll(query);
  }

  @Get('customer/:customerId')
  async findAllByCustomerId(@Param('customerId') customerId: string): Promise<Reservation[]> {
    return this.reservationService.findAllByCustomerId(customerId);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string): Promise<Reservation> {
    return this.reservationService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateReservationDto): Promise<Reservation> {
    return this.reservationService.createReservation(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateReservationDto): Promise<Reservation> {
    return this.reservationService.updateReservation(id, data);
  }
  
 
  @Get('scan/:identifier')
  async scanReservation(@Param('identifier') identifier: string): Promise<{ reservation: Reservation, vehicle: Vehicle }> {
    const reservation = await this.reservationService.findById(identifier);
    const vehicle = await this.vehicleService.pickup(reservation.vehicleId);
    return { reservation, vehicle };
  }
  
  
  @Post('vehicle-drop')
  async dropVehicle(@Body() data: DropVehicleDto) {
    return this.vehicleService.dropVehicle(data.firstName, data.reservationId, data.currentMileage);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.reservationService.deleteReservation(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error(error);
      res.status(500).json('Something went wrong');
    }
  }
}
