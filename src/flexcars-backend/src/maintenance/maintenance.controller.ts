import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res } from "@nestjs/common";
import { FindAllMaintenanceDto } from "./dto/FindAllMaintenance.dto";
import { VehicleMaintenance } from "@prisma/client";
import { ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { CreateMaintenanceDto } from "./dto/createMaintenance.dto";
import { UpdateMaintenanceDto } from "./dto/updateMaintenance.dto";
import { VehicleMaintenanceService } from "./maintenance.service";
import { Response } from "express";
@ApiBearerAuth('access-token') 
@Controller('vehicle-maintenance')
export class VehicleMaintenanceController {
  constructor(private readonly vehicleMaintenanceService: VehicleMaintenanceService) {}

  @Get()
  async findAll(@Query() query: FindAllMaintenanceDto): Promise<VehicleMaintenance[]> {
    return await this.vehicleMaintenanceService.findAll(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string): Promise<VehicleMaintenance> {
    return await this.vehicleMaintenanceService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateMaintenanceDto): Promise<VehicleMaintenance> {
    return await this.vehicleMaintenanceService.createVehicleMaintenance(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateMaintenanceDto,
  ): Promise<VehicleMaintenance> {
    return await this.vehicleMaintenanceService.updateVehicleMaintenance(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.vehicleMaintenanceService.deleteVehicleMaintenance(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error(error);
      res.status(500).json('Something went wrong');
    }
  }
}
