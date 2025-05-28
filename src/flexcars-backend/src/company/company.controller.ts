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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { CompaniesService } from './company.service';
import { CreateOrUpdateCompanyDto } from './dto/createOrUpdateCompany';
import { FindAllCompaniesDto } from './dto/FindAllCompaniesDto';
import { Company } from '@prisma/client';
@ApiBearerAuth('access-token') 
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(@Query() query: FindAllCompaniesDto): Promise<Company[]> {
    return await this.companiesService.findAll(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string): Promise<Company> {
    return await this.companiesService.findById(id);
  }

  @Post()
  async createCompany(
    @Body() createCompanyDto: CreateOrUpdateCompanyDto,
  ): Promise<Company> {
    return await this.companiesService.createCompany(createCompanyDto);
  }

  @Put(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: CreateOrUpdateCompanyDto,
  ): Promise<Company> {
    return await this.companiesService.updateCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  async deleteCompany(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.companiesService.deleteCompany(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error(error);
      
      res.status(500).json('Something went wrong');
    }
  }
}
