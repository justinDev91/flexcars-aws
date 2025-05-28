
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RentalServiceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.rentalService.findMany();
  }

  async findById(id: string) {
    const rentalService = await this.prisma.rentalService.findUnique({ where: { id } });
    if (!rentalService) throw new NotFoundException('Rental service not found');
    return rentalService;
  }

  create(data: Prisma.RentalServiceCreateInput) {
    return this.prisma.rentalService.create({ data });
  }

  update(id: string, data: Prisma.RentalServiceUpdateInput) {
    return this.prisma.rentalService.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.rentalService.delete({ where: { id } });
  }
}
