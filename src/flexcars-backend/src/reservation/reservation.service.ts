import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Reservation } from '@prisma/client';
import { FindAllReservationsDto } from './dto/findAllReservations.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as qrcode from 'qrcode';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

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
  const existing = await this.prisma.reservation.findUnique({ where: { id } });
  if (!existing) throw new NotFoundException('Reservation not found');

  const updated = await this.prisma.reservation.update({ where: { id }, data });

  if (data.status === 'CONFIRMED' && existing.status !== 'CONFIRMED') {
    const customer = await this.prisma.user.findUnique({ where: { id: updated.customerId } });
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: updated.vehicleId } });

    const qrContent = `
      vehicleId: ${updated.vehicleId}
      customerId: ${updated.customerId}
      startDatetime: ${updated.startDatetime}
      endDatetime: ${updated.endDatetime}
      pickupLocation: ${updated.pickupLocation}
      dropoffLocation: ${updated.dropoffLocation}
    `;

    const qrCodeBase64 = await qrcode.toDataURL(qrContent);

    await this.mailerService.sendMail({
      to: customer?.email,
      subject: 'Confirmation de votre réservation',
      template: 'rental-confirmation',
      context: {
        customerName: customer?.firstName ?? 'Client',
        vehicleBrand: vehicle?.brand,
        vehicleModel: vehicle?.model,
        plateNumber: vehicle?.plateNumber,
        fuelType: vehicle?.fuelType,
        startDatetime: updated.startDatetime?.toLocaleString('fr-FR'),
        endDatetime: updated.endDatetime?.toLocaleString('fr-FR'),
        pickupLocation: updated.pickupLocation,
        dropoffLocation: updated.dropoffLocation,
        qrCodeBase64: qrCodeBase64.replace(/^data:image\/png;base64,/, ''),
      },
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBase64.split(',')[1],
          encoding: 'base64',
          cid: 'qrcode',
        },
      ],
    });
  }

  return updated;
  }



  async deleteReservation(id: string): Promise<void> {
    await this.prisma.reservation.delete({ where: { id } });
  }
}
