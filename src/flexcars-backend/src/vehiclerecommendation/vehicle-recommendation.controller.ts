
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VehicleRecommendationService } from './vehicle-recommendation.dto';
import { CreateVehicleRecommendationDto } from './dto/create-vehicle-recommendation.dto';
import { UpdateVehicleRecommendationDto } from './dto/update-vehicle-recommendation.dto';

@ApiTags('vehicle-recommendations')
@Controller('vehicle-recommendations')
export class VehicleRecommendationController {
  constructor(private readonly vehicleRecommendationService: VehicleRecommendationService) {}

  @Get()
  findAll() {
    return this.vehicleRecommendationService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.vehicleRecommendationService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateVehicleRecommendationDto) {
    return this.vehicleRecommendationService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleRecommendationDto) {
    return this.vehicleRecommendationService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vehicleRecommendationService.delete(id);
  }
}
