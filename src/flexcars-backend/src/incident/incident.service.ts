
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.incident.findMany();
  }

  async findById(id: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  create(data: Prisma.IncidentCreateInput) {
    return this.prisma.incident.create({ data });
  }

  update(id: string, data: Prisma.IncidentUpdateInput) {
    return this.prisma.incident.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.incident.delete({ where: { id } });
  }
}
