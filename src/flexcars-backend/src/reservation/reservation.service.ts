import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateReservationDto } from './dto/createReservation.dto';
import { ReservationStatus } from './dto/createReservation.dto';
import { VehicleStatus } from '@prisma/client';
import { PricingRuleService } from '../pricingrule/pricing.rule.service';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';
import { Reservation } from '@prisma/client';
import * as qrcode from 'qrcode';
import { MailerService } from '@nestjs-modules/mailer';
import { PaymentService } from '../payment/payment.service';
import { InvoiceStatus } from '../invoice/dto/createInvoice.dto';
import { PaymentStatus } from '../payment/dto/createPayment.dto';
import { RefundReason } from '../payment/dto/createRefund.dto';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingRuleService: PricingRuleService,
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
  ) {}

  async findAll(customerId?: string) {
    return this.prisma.reservation.findMany({
      where: {
        ...(customerId && { customerId }),
      },
      include: {
        invoices: true,
        vehicle: true,
        customer: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        invoices: true,
        vehicle: true,
        customer: true,
      },
    });
  }

  async createReservation(data: CreateReservationDto): Promise<any> {    
    // Protection contre les duplications : vérifier les réservations existantes
    const existingReservations = await this.prisma.reservation.findMany({
      where: {
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        startDatetime: data.startDatetime,
        endDatetime: data.endDatetime,
        status: { not: 'CANCELLED' },
        // Chercher des réservations créées dans les 30 dernières secondes
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000),
        },
      },
    });

    if (existingReservations.length > 0) {
      console.log('⚠️ Tentative de duplication détectée, retour de la réservation existante');
      
      // Retourner la réservation existante avec la facture
      const reservationWithInvoice = await this.prisma.reservation.findUnique({
        where: { id: existingReservations[0].id },
        include: {
          invoices: true,
          vehicle: true,
          customer: true,
        },
      });

      if (!reservationWithInvoice) {
        throw new Error('Erreur lors de la récupération de la réservation existante');
      }

      return reservationWithInvoice;
    }

    // Vérifier la disponibilité du véhicule
    const availabilityCheck = await this.checkAvailability({
      vehicleId: data.vehicleId,
      startDatetime: data.startDatetime,
      endDatetime: data.endDatetime,
    });

    if (!availabilityCheck.isAvailable) {
      throw new BadRequestException('Le véhicule n\'est pas disponible pour cette période');
    }

    await this.prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: {
        status: VehicleStatus.RESERVED,
      },
    });

    // Calculer le prix de base
    let totalPrice = await this.pricingRuleService.calculateTotalPrice(data.vehicleId, data.startDatetime, data.endDatetime);
    
    // Ajouter le coût du car sitting si l'option est sélectionnée
    if (data.carSittingOption) {
      const carSittingCostHT = 50; // 50€ HT pour le car sitting
      const carSittingCostTTC = Math.round(carSittingCostHT * 1.2 * 100) / 100; // 60€ TTC (avec TVA 20%)
      totalPrice += carSittingCostTTC;
      console.log(`🚗 Option car sitting ajoutée: ${carSittingCostHT}€ HT → ${carSittingCostTTC}€ TTC`);
    }
    
    console.log(`💰 Prix total final: ${totalPrice}€ TTC`);
    
    const reservationData = {
      ...data,
      totalPrice,
    };
    const reservation = await this.prisma.reservation.create({data: reservationData});

    const invoice = await this.prisma.invoice.create({
      data: {
        reservationId: reservation.id,
        invoiceNumber: generateInvoiceNumber(),
        amount: totalPrice,
        status: 'UNPAID',
      },
    });

    // Retourner la réservation avec la facture incluse
    const reservationWithInvoice = await this.prisma.reservation.findUnique({
      where: { id: reservation.id },
      include: {
        invoices: true,
        vehicle: true,
        customer: true,
      },
    });

    if (!reservationWithInvoice) {
      throw new Error('Erreur lors de la création de la réservation');
    }

    return reservationWithInvoice;
  }

  async updateReservation(id: string, data: Prisma.ReservationUpdateInput, skipRefundLogic: boolean = false): Promise<Reservation> {
    const reservation = await this.prisma.reservation.findUnique({ 
      where: { id },
      include: {
        invoices: {
          include: {
            payments: true,
          },
        },
      },
    });
    
    if (!reservation) throw new NotFoundException('Reservation not found');

    // Gestion spéciale pour les annulations (SEULEMENT si pas de skipRefundLogic)
    if (data.status === 'CANCELLED' && reservation.status !== 'CANCELLED' && !skipRefundLogic) {
      await this.handleReservationCancellation(reservation);
    }

    const reservationUpdated = await this.prisma.reservation.update({ where: { id }, data });

    // Set vehicle status to AVAILABLE if reservation is cancelled
    if (data.status === 'CANCELLED' && reservation.status !== 'CANCELLED') {
      await this.prisma.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });
    }

    if (data.status === 'CONFIRMED' && reservation.status !== 'CONFIRMED') {
      const customer = await this.prisma.user.findUnique({ where: { id: reservationUpdated.customerId } });
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: reservationUpdated.vehicleId } });
      //TODO: Generate uniquement reservation NUMBER
      const qrContent = [
        `reservationId: ${reservation.id}`,
        `customer: '${customer?.firstName}' '${customer?.lastName}'`,
        `startDatetime: ${reservationUpdated.startDatetime}`,
        `endDatetime: ${reservationUpdated.endDatetime}`,
        `pickupLocation: ${reservationUpdated.pickupLocation}`,
        `dropoffLocation: ${reservationUpdated.dropoffLocation}`
      ].join('\n');

      const qrCodeBase64 = await qrcode.toDataURL(qrContent);

      await this.mailerService.sendMail({
        to: customer?.email,
        subject: 'Votre réservation a été confirmée',
        template: 'reservation-confirmed',
        context: {
          customerName: customer?.firstName ?? 'Client',
          vehicleName: `${vehicle?.brand} ${vehicle?.model}`,
          startDate: reservationUpdated.startDatetime ? new Date(reservationUpdated.startDatetime).toLocaleDateString('fr-FR') : 'Non défini',
          endDate: reservationUpdated.endDatetime ? new Date(reservationUpdated.endDatetime).toLocaleDateString('fr-FR') : 'Non défini',
          pickupLocation: reservationUpdated.pickupLocation,
          dropoffLocation: reservationUpdated.dropoffLocation,
          totalAmount: reservationUpdated.totalPrice,
        },
        attachments: [
          {
            filename: 'qrcode.png',
            content: qrCodeBase64.split(',')[1],
            encoding: 'base64',
            cid: 'qrcode',
          }
        ],
        });
    }

    return reservationUpdated;
  }

  private async handleReservationCancellation(reservation: any) {
    // Vérifier si la réservation a des factures payées
    const paidInvoices = reservation.invoices?.filter((invoice: any) => invoice.status === InvoiceStatus.PAID) || [];
    
    for (const invoice of paidInvoices) {
      // Trouver le paiement réussi pour cette facture
      const successfulPayment = invoice.payments.find(
        (payment: any) => payment.status === PaymentStatus.SUCCESS
      );

      if (successfulPayment) {
        try {
          // Créer le remboursement via le PaymentService
          await this.paymentService.createRefund({
            paymentId: successfulPayment.id,
            reservationId: reservation.id,
            reason: RefundReason.REQUESTED_BY_CUSTOMER,
          });
          
          console.log(`✅ Remboursement automatique créé pour la facture ${invoice.id} de la réservation ${reservation.id}`);
        } catch (error) {
          console.error(`❌ Erreur lors du remboursement automatique pour la facture ${invoice.id}:`, error);
          throw new BadRequestException(
            'Erreur lors du remboursement automatique. Veuillez contacter le support.'
          );
        }
      }
    }
  }

  async deleteReservation(id: string): Promise<void> {
    await this.prisma.reservation.delete({ where: { id } });
  }

  async checkAvailability(data: {
    vehicleId: string;
    startDatetime: string;
    endDatetime: string;
    excludeReservationId?: string;
  }): Promise<{
    isAvailable: boolean;
    conflicts?: Reservation[];
    message?: string;
  }> {
    const { vehicleId, startDatetime, endDatetime, excludeReservationId } = data;
    
    // Vérifier d'abord le statut actuel du véhicule
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return {
        isAvailable: false,
        message: 'Véhicule introuvable',
      };
    }

    // Vérifier si le véhicule est dans un état disponible
    const unavailableStatuses = ['RENTED', 'MAINTENANCE', 'INCIDENT'];
    if (unavailableStatuses.includes(vehicle.status || '')) {
      return {
        isAvailable: false,
        message: `Le véhicule n'est pas disponible (statut: ${vehicle.status})`,
      };
    }
    
    // Rechercher les réservations en conflit
    const conflictingReservations = await this.prisma.reservation.findMany({
      where: {
        vehicleId,
        id: excludeReservationId ? { not: excludeReservationId } : undefined,
        status: { not: 'CANCELLED' },
        OR: [
          {
            startDatetime: { lte: startDatetime },
            endDatetime: { gt: startDatetime },
          },
          {
            startDatetime: { lt: endDatetime },
            endDatetime: { gte: endDatetime },
          },
          {
            startDatetime: { gte: startDatetime },
            endDatetime: { lte: endDatetime },
          },
        ],
      },
      include: {
        vehicle: true,
        customer: true,
      },
    });

    const isAvailable = conflictingReservations.length === 0;

    return {
      isAvailable,
      conflicts: conflictingReservations,
      message: isAvailable 
        ? 'Le véhicule est disponible pour cette période'
        : 'Le véhicule n\'est pas disponible pour cette période',
    };
  }
}
