import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Reservation } from '@prisma/client';
import { FindAllReservationsDto } from './dto/findAllReservations.dto';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllReservationsDto): Promise<Reservation[]> {
    const { page, limit } = params;
    return this.prisma.reservation.findMany({
      skip: limit * (page - 1),
      take: limit,
    });
  }

  async findById(id: string): Promise<Reservation> {
    const record = await this.prisma.reservation.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Reservation not found');
    return record;
  }

  async createReservation(data: Prisma.ReservationCreateInput): Promise<Reservation> {
    return this.prisma.reservation.create({ data });
  }

  async updateReservation(id: string, data: Prisma.ReservationUpdateInput): Promise<Reservation> {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async deleteReservation(id: string): Promise<void> {
    await this.prisma.reservation.delete({ where: { id } });
  }
}
