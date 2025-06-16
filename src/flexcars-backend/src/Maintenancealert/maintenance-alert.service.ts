import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, MaintenanceAlert } from '@prisma/client';
import { FindAllMaintenanceAlertDto } from './dto/FindAllMaintenanceAlert.dto';

@Injectable()
export class MaintenanceAlertService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllMaintenanceAlertDto): Promise<MaintenanceAlert[]> {
    const { page, limit } = params;
    return this.prisma.maintenanceAlert.findMany({
      skip: limit * (page - 1),
      take: limit,
      orderBy: { alertDate: 'desc' },
    });
  }

  async findById(id: string): Promise<MaintenanceAlert> {
    const alert = await this.prisma.maintenanceAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Maintenance alert not found');
    return alert;
  }

  async createMaintenanceAlert(data: Prisma.MaintenanceAlertCreateInput): Promise<MaintenanceAlert> {
    return this.prisma.maintenanceAlert.create({ data });
  }

  async updateMaintenanceAlert(id: string, data: Prisma.MaintenanceAlertUpdateInput): Promise<MaintenanceAlert> {
    return this.prisma.maintenanceAlert.update({ where: { id }, data });
  }

  async deleteMaintenanceAlert(id: string): Promise<MaintenanceAlert> {
    return this.prisma.maintenanceAlert.delete({ where: { id } });
  }
}
