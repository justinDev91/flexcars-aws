import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { Vehicle } from '@prisma/client';
import { CreateVehicleDto } from './dto/createVehicule.dto';
import { FindAllVehiclesDto } from './dto/FindAllVehicles.dto';
import { VehiclesService } from './vehicle.service';
import { UpdateVehicleDto } from './dto/updateVehicle.dto';
import { DropVehicleDto, DropVehicleWithCarSitterDto, PenaltyCalculationDto } from './dto/DropVehicle.dto';
import { PickupVehicleDto, PickupVehicleWithCarSitterDto, ValidatePickupDto, CheckDocumentsDto } from './dto/PickupVehicle.dto';

@ApiBearerAuth('access-token') 
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(@Query() query: FindAllVehiclesDto): Promise<Vehicle[]> {
    return await this.vehiclesService.findAll(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string): Promise<Vehicle> {
    return await this.vehiclesService.findById(id);
  }

  @Post()
  async createVehicle(
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    return await this.vehiclesService.createVehicle(createVehicleDto);
  }

  @Put(':id')
  async updateVehicle(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    return await this.vehiclesService.updateVehicle(id, updateVehicleDto);
  }

  @Post('dropoff/normal')
  @ApiOperation({ summary: 'Drop off vehicle without car sitter' })
  async dropoffNormal(@Body() data: DropVehicleDto) {
    return await this.vehiclesService.dropoffNormal(data);
  }

  @Post('dropoff/with-carsitter')
  @ApiOperation({ summary: 'Drop off vehicle with car sitter assistance' })
  async dropoffWithCarSitter(@Body() data: DropVehicleWithCarSitterDto) {
    return await this.vehiclesService.dropoffWithCarSitter(data);
  }

  @Post('dropoff/calculate-penalty')
  @ApiOperation({ summary: 'Calculate penalty for late return or accidents' })
  async calculatePenalty(@Body() data: { reservationId: string; hasAccident: boolean }) {
    return await this.vehiclesService.calculateDropoffPenalty(data.reservationId, data.hasAccident);
  }

  // ======= PICKUP ENDPOINTS =======

  @Post('pickup/check-documents')
  @ApiOperation({ summary: 'Check if user has required documents for pickup' })
  async checkDocuments(@Body() data: CheckDocumentsDto) {
    return await this.vehiclesService.checkUserDocuments(data.userId);
  }

  @Post('pickup/can-pickup')
  @ApiOperation({ summary: 'Check if pickup is possible for a reservation' })
  async canPickup(@Body() data: { reservationId: string }) {
    return await this.vehiclesService.canPickupVehicle(data.reservationId);
  }

  @Post('pickup/normal')
  @ApiOperation({ summary: 'Pick up vehicle without car sitter' })
  async pickupNormal(@Body() data: PickupVehicleDto) {
    return await this.vehiclesService.pickupNormal({
      reservationId: data.reservationId,
      requestedTime: data.requestedTime,
      pickupLocation: data.pickupLocation
    });
  }

  @Post('pickup/with-carsitter')
  @ApiOperation({ summary: 'Pick up vehicle with car sitter assistance' })
  async pickupWithCarSitter(@Body() data: PickupVehicleWithCarSitterDto) {
    return await this.vehiclesService.pickupWithCarSitter({
      reservationId: data.reservationId,
      carSitterId: data.carSitterId,
      requestedTime: data.requestedTime,
      pickupLocation: data.pickupLocation
    });
  }

  @Post('pickup/validate')
  @ApiOperation({ summary: 'Validate pickup request by car sitter' })
  async validatePickup(@Body() data: ValidatePickupDto) {
    return await this.vehiclesService.validatePickup({
      pickupRequestId: data.pickupRequestId,
      isValidated: data.isValidated,
      notes: data.notes
    });
  }

  @Get(':id/pickup')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Pick up vehicle (change status to RENTED)' })
  async pickup(@Param('id') id: string) {
    return await this.vehiclesService.pickup(id);
  }

  @Delete(':id')
  async deleteVehicle(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.vehiclesService.deleteVehicle(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error(error);
      
      res.status(500).json('Something went wrong');
    }
  }
}
