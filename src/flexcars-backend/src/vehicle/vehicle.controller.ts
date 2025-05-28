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
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { Vehicle } from '@prisma/client';
import { CreateVehicleDto } from './dto/createVehicule.dto';
import { FindAllVehiclesDto } from './dto/FindAllVehicles.dto';
import { VehiclesService } from './vehicle.service';
import { UpdateVehicleDto } from './dto/updateVehicle.dto';

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
