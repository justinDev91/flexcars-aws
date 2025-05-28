import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, RentalContract } from '@prisma/client';

@Injectable()
export class RentalContractService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RentalContract[]> {
    return this.prisma.rentalContract.findMany();
  }

  async findById(id: string): Promise<RentalContract> {
    const contract = await this.prisma.rentalContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Rental contract not found');
    return contract;
  }

  async create(data: Prisma.RentalContractCreateInput): Promise<RentalContract> {
    return this.prisma.rentalContract.create({ data });
  }

  async update(id: string, data: Prisma.RentalContractUpdateInput): Promise<RentalContract> {
    return this.prisma.rentalContract.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.rentalContract.delete({ where: { id } });
  }
}
