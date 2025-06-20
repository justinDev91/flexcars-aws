import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Vehicle } from '@prisma/client';
import { FindAllVehiclesDto } from './dto/FindAllVehicles.dto';
import { PricingType } from 'src/pricingrule/dto/createPricingRule.dto';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';
import { ReservationStatus } from 'src/reservation/dto/createReservation.dto';
import { VehicleStatus } from './dto/createVehicule.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingRuleService: PricingRuleService,
  ) {}

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

  async dropVehicle(firstName: string, reservationId: string, currentMileage: number) {
    const user = await this.prisma.user.findFirst({ where: { firstName } });
    if (!user) throw new NotFoundException('User not found');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.status !== ReservationStatus.CONFIRMED
    ) throw new NotFoundException('Reservation must be confirmed to drop the vehicle');


    const now = new Date();
    const isLate = reservation.endDatetime ? now > reservation.endDatetime : false;

    const accident = await this.prisma.incident.findFirst({
      where: { reservationId },
    });

    const hasAccident = !!accident;

    let penaltyAmount = 0;
    let invoiceId: string = ""

    if (hasAccident) {
      const pricingRule = await this.prisma.pricingRule.findFirst({
        where: {
          vehicleId: reservation.vehicleId,
          type: PricingType.ACCIDENT,
        },
      });

      penaltyAmount += pricingRule?.basePrice ?? 100;
    }

   
    if (isLate && reservation.endDatetime) {
      penaltyAmount += await this.pricingRuleService.calculatePenaltyAmount(
        reservation.vehicleId,
        PricingType.LATER_PENALTY,
        reservation.endDatetime,
        now,
      );
    }

    if (penaltyAmount > 0) {
      const invoice = await this.prisma.invoice.update({
        where: { reservationId },
        data: {
          penaltyAmount,
          status: 'UNPAID',
        },
      });

    await this.prisma.vehicle.update({
      where: { id: reservation.vehicleId },
      data: {
        status: VehicleStatus.AVAILABLE,
        currentMileage,
      },
    });

    await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.COMPLETED,
      },
    });

    invoiceId = invoice.id

    return { message: 'Vehicle dropped successfully', penaltyAmount, invoiceId };
    } 
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
