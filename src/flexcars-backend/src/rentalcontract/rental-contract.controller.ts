import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateRentalContractDto } from './dto/createRentalContract.dto';
import { UpdateRentalContractDto } from './dto/updateRentalContract.dto';
import { RentalContract } from '@prisma/client';
import { RentalContractService } from './rental-contract.service';

@ApiBearerAuth('access-token') 
@Controller('rental-contracts')
export class RentalContractController { 
  constructor(private readonly rentalContractService: RentalContractService) {}

  @Get()
  async findAll(): Promise<RentalContract[]> {
    return this.rentalContractService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string): Promise<RentalContract> {
    return this.rentalContractService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateRentalContractDto): Promise<RentalContract> {
    return this.rentalContractService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateRentalContractDto): Promise<RentalContract> {
    return this.rentalContractService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.rentalContractService.delete(id);
  }
}
