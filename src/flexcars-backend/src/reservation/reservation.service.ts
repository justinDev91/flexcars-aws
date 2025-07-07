import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Reservation } from '@prisma/client';
import { FindAllReservationsDto } from './dto/findAllReservations.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as qrcode from 'qrcode';
import { CreateReservationDto } from './dto/createReservation.dto';
import { VehicleStatus } from 'src/vehicle/dto/createVehicule.dto';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly pricingRuleService: PricingRuleService
  ) {}

  async findAll(params: FindAllReservationsDto): Promise<Reservation[]> {
    const { page, limit } = params;
    return this.prisma.reservation.findMany({
      // skip: limit * (page - 1),
      // take: limit,
    });
  }

  async findById(id: string): Promise<Reservation> {
    const record = await this.prisma.reservation.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Reservation not found');
    return record;
  }

  async createReservation(data: CreateReservationDto): Promise<Reservation> {    
    await this.prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: {
        status: VehicleStatus.RESERVED,
      },
    });

    const totalPrice = await this.pricingRuleService.calculateTotalPrice(data.vehicleId, data.startDatetime, data.endDatetime)
    
    const reservationData = {
        ...data,
        totalPrice,
     };
    return this.prisma.reservation.create({data: reservationData});
  }


  async updateReservation(id: string, data: Prisma.ReservationUpdateInput): Promise<Reservation> {
  const reservation = await this.prisma.reservation.findUnique({ where: { id } });
  if (!reservation) throw new NotFoundException('Reservation not found');

  const reservationUpdated = await this.prisma.reservation.update({ where: { id }, data });

  if (data.status === 'CONFIRMED' && reservation.status !== 'CONFIRMED') {
    const customer = await this.prisma.user.findUnique({ where: { id: reservationUpdated.customerId } });
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: reservationUpdated.vehicleId } });
    //TODO: Generate uniquement reservation NUMBER
    const qrContent = `
      reservationId: ${reservation.id}
      customer: '${customer?.firstName}' ' ${customer?.lastName}'
      startDatetime: ${reservationUpdated.startDatetime}
      endDatetime: ${reservationUpdated.endDatetime}
      pickupLocation: ${reservationUpdated.pickupLocation}
      dropoffLocation: ${reservationUpdated.dropoffLocation}
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
        startDatetime: reservationUpdated.startDatetime?.toLocaleString('fr-FR'),
        endDatetime: reservationUpdated.endDatetime?.toLocaleString('fr-FR'),
        pickupLocation: reservationUpdated.pickupLocation,
        dropoffLocation: reservationUpdated.dropoffLocation,
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

  return reservationUpdated;
  }


  async deleteReservation(id: string): Promise<void> {
    await this.prisma.reservation.delete({ where: { id } });
  }

  async findAllByCustomerId(customerId: string): Promise<Reservation[]> {
    const customerExists = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!customerExists) return [];                         
    return this.prisma.reservation.findMany({
      where: { customerId },
    });
  }
}
