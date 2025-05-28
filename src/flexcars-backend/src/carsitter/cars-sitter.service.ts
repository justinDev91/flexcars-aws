
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CarSitterService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.carSitter.findMany();
  }

  async findById(id: string) {
    const carSitter = await this.prisma.carSitter.findUnique({ where: { id } });
    if (!carSitter) throw new NotFoundException('Car sitter not found');
    return carSitter;
  }

  create(data: Prisma.CarSitterCreateInput) {
    return this.prisma.carSitter.create({ data });
  }

  update(id: string, data: Prisma.CarSitterUpdateInput) {
    return this.prisma.carSitter.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.carSitter.delete({ where: { id } });
  }
}
