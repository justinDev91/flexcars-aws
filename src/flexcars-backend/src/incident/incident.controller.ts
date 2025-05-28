
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IncidentService } from './incident.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
@ApiBearerAuth('access-token') 
@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Get()
  findAll() {
    return this.incidentService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.incidentService.findById(id);
  }

  @Post()
  create(@Body() data: CreateIncidentDto) {
    return this.incidentService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateIncidentDto) {
    return this.incidentService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.incidentService.delete(id);
  }
}
