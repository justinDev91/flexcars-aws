
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReservationServiceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.reservationService.findMany();
  }

  async findById(id: string) {
    const reservationService = await this.prisma.reservationService.findUnique({ where: { id } });
    if (!reservationService) throw new NotFoundException('Reservation service not found');
    return reservationService;
  }

  create(data: Prisma.ReservationServiceCreateInput) {
    return this.prisma.reservationService.create({ data });
  }

  delete(id: string) {
    return this.prisma.reservationService.delete({ where: { id } });
  }
}
