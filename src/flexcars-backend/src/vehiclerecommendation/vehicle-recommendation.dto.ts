
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehicleRecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.vehicleRecommendation.findMany();
  }

  async findById(id: string) {
    const recommendation = await this.prisma.vehicleRecommendation.findUnique({ where: { id } });
    if (!recommendation) throw new NotFoundException('Vehicle recommendation not found');
    return recommendation;
  }

  create(data: Prisma.VehicleRecommendationCreateInput) {
    return this.prisma.vehicleRecommendation.create({ data });
  }

  update(id: string, data: Prisma.VehicleRecommendationUpdateInput) {
    return this.prisma.vehicleRecommendation.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.vehicleRecommendation.delete({ where: { id } });
  }
}
