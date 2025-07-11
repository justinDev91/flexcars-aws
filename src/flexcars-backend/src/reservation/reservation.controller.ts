import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateReservationDto } from './dto/createReservation.dto';
import { UpdateReservationDto } from './dto/updateReservation.dto';
import { FindAllReservationsDto } from './dto/findAllReservations.dto';
import { ReservationService } from './reservation.service';
import { Response } from 'express';
import { Reservation, Vehicle } from '@prisma/client';
import { VehiclesService } from '../vehicle/vehicle.service';
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
    return this.reservationService.findAll(query.customerId);
  }

  @Get('customer/:customerId')
  async findAllByCustomerId(@Param('customerId') customerId: string): Promise<Reservation[]> {
    return this.reservationService.findAll(customerId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const reservation = await this.reservationService.findById(id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation;
  }

  @Post()
  async create(@Body() data: CreateReservationDto): Promise<any> {
    return this.reservationService.createReservation(data);
  }

  @Post('check-availability')
  async checkAvailability(@Body() data: {
    vehicleId: string;
    startDatetime: string;
    endDatetime: string;
    excludeReservationId?: string;
  }): Promise<{
    isAvailable: boolean;
    conflicts?: Reservation[];
    message?: string;
  }> {
    return this.reservationService.checkAvailability(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateReservationDto): Promise<Reservation> {
    return this.reservationService.updateReservation(id, data);
  }
  
 
  @Get('/scan/:identifier')
  async scanReservation(@Param('identifier') identifier: string) {
    const reservation = await this.reservationService.findById(identifier);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
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
