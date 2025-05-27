import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { Prisma, VehicleMaintenance } from "@prisma/client";
import { FindAllMaintenanceDto } from "./dto/FindAllMaintenance.dto";

@Injectable()
export class VehicleMaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllMaintenanceDto): Promise<VehicleMaintenance[]> {
    const { page, limit } = params;
    return this.prisma.vehicleMaintenance.findMany({
      skip: limit * (page - 1),
      take: limit,
    });
  }

  async findById(id: string): Promise<VehicleMaintenance> {
    const record = await this.prisma.vehicleMaintenance.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Vehicle maintenance record not found');
    return record;
  }

  async createVehicleMaintenance(data: Prisma.VehicleMaintenanceCreateInput) {
    return this.prisma.vehicleMaintenance.create({ data });
  }

  async updateVehicleMaintenance(id: string, data:  Prisma.VehicleMaintenanceUpdateInput) {
    return this.prisma.vehicleMaintenance.update({ where: { id }, data });
  }

  async deleteVehicleMaintenance(id: string) {
    return this.prisma.vehicleMaintenance.delete({ where: { id } });
  }
}
