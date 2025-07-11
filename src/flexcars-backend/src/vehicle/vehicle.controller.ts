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
