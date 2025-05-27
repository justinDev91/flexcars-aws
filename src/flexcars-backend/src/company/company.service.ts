import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FindAllCompaniesDto } from './dto/FindAllCompaniesDto';
import { CreateOrUpdateCompanyDto } from './dto/createOrUpdateCompany';
import { Company } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllCompaniesDto): Promise<Company[]> {
    const { page, limit } = params;
    
    return await this.prisma.company.findMany({
      skip: limit * (page - 1),
      take: limit,
    });
  }

  async findById(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async createCompany(data: CreateOrUpdateCompanyDto) {
    return this.prisma.company.create({
      data,
    });
  }

  async updateCompany(id: string, data: CreateOrUpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async deleteCompany(id: string) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
