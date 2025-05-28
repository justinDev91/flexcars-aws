
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRentalServiceDto } from './dto/createRentalService.dto';
import { UpdateRentalServiceDto } from './dto/updateRentalService.dto';
import { RentalServiceService } from './rentalservice.service';

@ApiTags('rental-services')
@Controller('rental-services')
export class RentalServiceController {
  constructor(private readonly rentalServiceService: RentalServiceService) {}

  @Get()
  findAll() {
    return this.rentalServiceService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.rentalServiceService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRentalServiceDto) {
    return this.rentalServiceService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRentalServiceDto) {
    return this.rentalServiceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.rentalServiceService.delete(id);
  }
}
