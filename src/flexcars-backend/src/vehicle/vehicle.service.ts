import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Vehicle } from '@prisma/client';
import { FindAllVehiclesDto } from './dto/FindAllVehicles.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllVehiclesDto): Promise<Vehicle[]> {
    const { page, limit } = params;
    
    return await this.prisma.vehicle.findMany({
      skip: limit * (page - 1),
      take: limit,
    });
  }

  async findById(id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async createVehicle(data: Prisma.VehicleCreateInput) {
    return this.prisma.vehicle.create({
      data,
    });
  }

  
  async pickup(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { status: 'RENTED' },
    });

  }


  async updateVehicle(id: string, data: Prisma.VehicleCreateInput) {
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async deleteVehicle(id: string) {
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
