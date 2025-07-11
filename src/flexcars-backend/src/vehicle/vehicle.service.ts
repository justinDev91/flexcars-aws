import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Vehicle, DropoffStatus } from '@prisma/client';
import { FindAllVehiclesDto } from './dto/FindAllVehicles.dto';
import { PricingType } from 'src/pricingrule/dto/createPricingRule.dto';
import { PricingRuleService } from 'src/pricingrule/pricing.rule.service';
import { VehicleStatus } from './dto/createVehicule.dto';
import { ReservationStatus } from 'src/reservation/dto/createReservation.dto';
import { DropVehicleDto, DropVehicleWithCarSitterDto } from './dto/DropVehicle.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingRuleService: PricingRuleService,
    private readonly mailerService: MailerService,
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

  async calculateDropoffPenalty(reservationId: string, hasAccident: boolean) {
    const reservation = await this.prisma.reservation.findUnique({ 
      where: { id: reservationId },
      include: {
        invoices: true
      }
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const now = new Date();
    const isLate = reservation.endDatetime ? now > reservation.endDatetime : false;

    let penaltyAmount = 0;
    let message = '';

    // Pénalité pour accident
    if (hasAccident) {
      const accidentPricingRule = await this.prisma.pricingRule.findFirst({
        where: {
          vehicleId: reservation.vehicleId,
          type: PricingType.ACCIDENT,
        },
      });
      
      if (accidentPricingRule?.basePrice) {
        penaltyAmount += accidentPricingRule.basePrice * 1.2; // TTC
        message += 'Pénalité pour accident. ';
      } else {
        penaltyAmount += 100; // Pénalité par défaut de 100€ TTC pour accident
        message += 'Pénalité pour accident (montant forfaitaire). ';
      }
    }

    // Pénalité pour retard
    if (isLate && reservation.endDatetime) {
      const latePenalty = await this.pricingRuleService.calculatePenaltyAmount(
        reservation.vehicleId,
        PricingType.LATER_PENALTY,
        reservation.endDatetime,
        now,
      );
      penaltyAmount += latePenalty;
      
      const hoursLate = Math.ceil((now.getTime() - reservation.endDatetime.getTime()) / (1000 * 60 * 60));
      message += `Pénalité pour ${hoursLate} heure(s) de retard. `;
    }

    if (penaltyAmount === 0) {
      return {
        penaltyAmount: 0,
        penaltyInvoiceId: null,
        message: 'Aucune pénalité à payer'
      };
    }

    // Créer une nouvelle facture de pénalité
    const penaltyInvoice = await this.prisma.invoice.create({
      data: {
        reservationId,
        amount: 0,
        penaltyAmount,
        status: 'UNPAID',
        invoiceType: 'PENALTY',
      },
    });

    return {
      penaltyAmount,
      penaltyInvoiceId: penaltyInvoice.id,
      message: message.trim()
    };
  }

  async dropoffNormal(data: DropVehicleDto) {
    const reservation = await this.prisma.reservation.findUnique({ 
      where: { id: data.reservationId },
      include: {
        customer: true,
        vehicle: true,
        invoices: true
      }
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Reservation must be confirmed to drop the vehicle');
    }

    // Vérifier s'il y a des pénalités
    const penaltyCheck = await this.calculateDropoffPenalty(data.reservationId, data.hasAccident);
    
    if (penaltyCheck.penaltyAmount > 0) {
      return {
        needsPayment: true,
        penaltyAmount: penaltyCheck.penaltyAmount,
        penaltyInvoiceId: penaltyCheck.penaltyInvoiceId,
        message: `Vous devez payer ${penaltyCheck.penaltyAmount}€ TTC avant de terminer le dropoff. ${penaltyCheck.message}`
      };
    }

    // Pas de pénalité, on peut finaliser le dropoff
    await this.finalizeDropoff(reservation, data.currentMileage, data.currentLocationLat, data.currentLocationLng);

    return {
      needsPayment: false,
      message: 'Véhicule rendu avec succès',
      penaltyAmount: 0
    };
  }

  async dropoffWithCarSitter(data: DropVehicleWithCarSitterDto) {
    const reservation = await this.prisma.reservation.findUnique({ 
      where: { id: data.reservationId },
      include: {
        customer: true,
        vehicle: true,
        invoices: true
      }
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Reservation must be confirmed to drop the vehicle');
    }

    if (!reservation.carSittingOption) {
      throw new BadRequestException('Car sitting option was not selected for this reservation');
    }

    // Vérifier s'il y a des pénalités
    const penaltyCheck = await this.calculateDropoffPenalty(data.reservationId, data.hasAccident);
    
    if (penaltyCheck.penaltyAmount > 0) {
      return {
        needsPayment: true,
        penaltyAmount: penaltyCheck.penaltyAmount,
        penaltyInvoiceId: penaltyCheck.penaltyInvoiceId,
        message: `Vous devez payer ${penaltyCheck.penaltyAmount}€ TTC avant que le carsitter puisse valider le dropoff. ${penaltyCheck.message}`
      };
    }

    // Créer la demande de dropoff
    const dropoffRequest = await this.prisma.dropoffRequest.create({
      data: {
        reservationId: data.reservationId,
        carSitterId: data.carSitterId,
        currentMileage: data.currentMileage,
        dropoffTime: new Date(data.dropoffTime),
        hasAccident: data.hasAccident,
        locationLat: data.currentLocationLat,
        locationLng: data.currentLocationLng,
        signature: data.signature,
        status: DropoffStatus.PENDING,
        penaltyAmount: penaltyCheck.penaltyAmount
      },
      include: {
        carSitter: {
          include: {
            user: true
          }
        }
      }
    });

    // Envoyer un email au carsitter
    if (dropoffRequest.carSitter?.user?.email) {
      await this.mailerService.sendMail({
        to: dropoffRequest.carSitter.user.email,
        subject: 'Nouvelle demande de validation de dropoff',
        template: 'carsitter-dropoff-validation',
        context: {
          carSitterName: `${dropoffRequest.carSitter.user.firstName} ${dropoffRequest.carSitter.user.lastName}`,
          customerName: `${reservation.customer?.firstName} ${reservation.customer?.lastName}`,
          vehicleName: `${reservation.vehicle?.brand} ${reservation.vehicle?.model}`,
          dropoffTime: new Date(data.dropoffTime).toLocaleDateString('fr-FR'),
          location: `${data.currentLocationLat}, ${data.currentLocationLng}`,
          mileage: data.currentMileage,
          hasAccident: data.hasAccident ? 'Oui' : 'Non',
          validationUrl: `${process.env.FRONTEND_URL}/carsitter/validate/${dropoffRequest.id}`
        }
      });
    }

    return {
      message: 'Demande de dropoff créée avec succès. Le carsitter va recevoir un email pour validation.',
      dropoffRequestId: dropoffRequest.id
    };
  }

  private async finalizeDropoff(reservation: any, currentMileage: number, locationLat: number, locationLng: number) {
    // Mettre à jour le véhicule
    await this.prisma.vehicle.update({
      where: { id: reservation.vehicleId },
      data: {
        status: VehicleStatus.AVAILABLE,
        currentMileage,
        locationLat,
        locationLng
      },
    });

    // Mettre à jour la réservation
    await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.COMPLETED,
      },
    });

    // Envoyer un email de confirmation au client
    if (reservation.customer?.email) {
      await this.mailerService.sendMail({
        to: reservation.customer.email,
        subject: 'Retour de véhicule confirmé',
        template: 'dropoff-confirmed',
        context: {
          customerName: reservation.customer.firstName || 'Client',
          vehicleName: `${reservation.vehicle?.brand} ${reservation.vehicle?.model}`,
          dropoffTime: new Date().toLocaleDateString('fr-FR'),
          notes: 'Retour effectué avec succès'
        }
      });
    }
  }

  // Ancienne méthode conservée pour compatibilité
  async dropVehicle(firstName: string, reservationId: string, currentMileage: number) {
    const user = await this.prisma.user.findFirst({ where: { firstName } });
    if (!user) throw new NotFoundException('User not found');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        invoices: {
          include: {
            payments: true,
          },
        },
        customer: true,
        vehicle: true,
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const invalidStatuses: ReservationStatus[] = [
      ReservationStatus.COMPLETED,
      ReservationStatus.PENDING,
      ReservationStatus.CANCELLED,
    ];

    if (invalidStatuses.includes(reservation.status as ReservationStatus)) {
      throw new BadRequestException('Reservation must be confirmed to drop the vehicle');
    }

    const now = new Date();
    const isLate = reservation.endDatetime ? now > reservation.endDatetime : false;

    const accident = await this.prisma.incident.findFirst({ where: { reservationId } });
    const hasAccident = !!accident;

    let penaltyAmount = 0;
    let invoiceId = '';

    if (hasAccident) {
      const pricingRule = await this.prisma.pricingRule.findFirst({
        where: {
          vehicleId: reservation.vehicleId,
          type: PricingType.ACCIDENT,
        },
      });
      if (!pricingRule?.basePrice) {
        throw new NotFoundException(`No accident pricing rule configured for this vehicle`);
      }
      penaltyAmount += pricingRule.basePrice;
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
      const invoice = await this.prisma.invoice.findFirst({
        where: { reservationId },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found for this reservation');
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          penaltyAmount,
          status: 'UNPAID',
        },
      });

      invoiceId = updatedInvoice.id;

      return {
        message: 'You must pay a penalty to complete the vehicle drop-off.',
        penaltyAmount,
        invoiceId,
      };
    }

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

    return {
      message: 'Vehicle dropped successfully',
      penaltyAmount,
      invoiceId,
    };
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
