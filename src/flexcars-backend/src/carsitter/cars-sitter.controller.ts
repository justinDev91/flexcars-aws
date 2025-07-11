
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CarSitterService } from './cars-sitter.service';
import { CreateCarSitterDto } from './dto/create-car-sitter.dto';
import { UpdateCarSitterDto } from './dto/update-cars-sitter.tdo';
import { ValidateDropoffDto } from '../vehicle/dto/DropVehicle.dto';

@ApiBearerAuth('access-token') 
@Controller('car-sitters')
export class CarSitterController {
  constructor(private readonly carSitterService: CarSitterService) {}

  @Get()
  @ApiOperation({ summary: 'Get all car sitters' })
  findAll() {
    return this.carSitterService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available car sitters' })
  findAvailable() {
    return this.carSitterService.findAllAvailable();
  }

  @Get('available-near')
  @ApiOperation({ summary: 'Get available car sitters near a location' })
  @ApiQuery({ name: 'lat', required: true, description: 'Latitude' })
  @ApiQuery({ name: 'lng', required: true, description: 'Longitude' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in km', default: 10 })
  findAvailableNear(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string
  ) {
    return this.carSitterService.findAvailable(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 10
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get car sitter by ID' })
  findById(@Param('id') id: string) {
    return this.carSitterService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new car sitter' })
  create(@Body() data: CreateCarSitterDto) {
    return this.carSitterService.create(data);
  }

  @Put(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update car sitter' })
  update(@Param('id') id: string, @Body() data: UpdateCarSitterDto) {
    return this.carSitterService.update(id, data);
  }

  @Get('dropoff-request/:id')
  @ApiOperation({ summary: 'Get a dropoff request by ID' })
  @ApiParam({ name: 'id', description: 'Dropoff request ID' })
  getDropoffRequest(@Param('id') id: string) {
    return this.carSitterService.getDropoffRequest(id);
  }

  @Post('validate-dropoff')
  @ApiOperation({ summary: 'Validate a dropoff request by car sitter' })
  validateDropoff(@Body() data: ValidateDropoffDto) {
    return this.carSitterService.validateDropoff(data);
  }

  @Delete(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete car sitter' })
  delete(@Param('id') id: string) {
    return this.carSitterService.delete(id);
  }
}
