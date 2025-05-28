
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CarSitterService } from './cars-sitter.service';
import { CreateCarSitterDto } from './dto/create-car-sitter.dto';
import { UpdateCarSitterDto } from './dto/update-cars-sitter.tdo';

@ApiTags('car-sitters')
@Controller('car-sitters')
export class CarSitterController {
  constructor(private readonly carSitterService: CarSitterService) {}

  @Get()
  findAll() {
    return this.carSitterService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.carSitterService.findById(id);
  }

  @Post()
  create(@Body() data: CreateCarSitterDto) {
    return this.carSitterService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateCarSitterDto) {
    return this.carSitterService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.carSitterService.delete(id);
  }
}
