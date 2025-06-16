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
import { MaintenanceAlert } from '@prisma/client';
import { FindAllMaintenanceAlertDto } from './dto/FindAllMaintenanceAlert.dto';
import { MaintenanceAlertService } from './maintenance-alert.service';
import { CreateMaintenanceAlertDto } from './dto/createMaintenanceAlert.dto';
import { UpdateMaintenanceAlertDto } from './dto/updateMaintenanceAlert.dto';


@ApiBearerAuth('access-token')
@Controller('maintenance-alerts')
export class MaintenanceAlertController {
  constructor(private readonly maintenanceAlertService: MaintenanceAlertService) {}

  @Get()
  async findAll(@Query() query: FindAllMaintenanceAlertDto): Promise<MaintenanceAlert[]> {
    return await this.maintenanceAlertService.findAll(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string): Promise<MaintenanceAlert> {
    return await this.maintenanceAlertService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateMaintenanceAlertDto): Promise<MaintenanceAlert> {
    return await this.maintenanceAlertService.createMaintenanceAlert(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateMaintenanceAlertDto,
  ): Promise<MaintenanceAlert> {
    return await this.maintenanceAlertService.updateMaintenanceAlert(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.maintenanceAlertService.deleteMaintenanceAlert(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error(error);
      res.status(500).json('Something went wrong');
    }
  }
}
