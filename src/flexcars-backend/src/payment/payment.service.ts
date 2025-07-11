import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePaymentDto, PaymentStatus } from './dto/createPayment.dto';
import { CreateRefundDto, CreateRefundByInvoiceDto, RefundReason } from './dto/createRefund.dto';
import { InvoiceStatus } from '../invoice/dto/createInvoice.dto';
import { ReservationService } from '../reservation/reservation.service';
import { ReservationStatus } from '../reservation/dto/createReservation.dto';
import { VehicleStatus } from '../vehicle/dto/createVehicule.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ReservationService))
    private readonly reservationService: ReservationService,
    private readonly mailerService: MailerService,
    private readonly stripeService: StripeService,
  ) {}

  findAll() {
    return this.prisma.payment.findMany();
  }

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

 async create(data: CreatePaymentDto) {
    console.log('💳 Payment created start :', data);
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid or not eligible for payment');
    }

    if (!invoice.reservationId) {
      throw new Error('Aucune réservation associée à cette facture');
    }

    const reservation = await this.reservationService.updateReservation(invoice.reservationId, { status: ReservationStatus.CONFIRMED })
    console.log('💳 Payment created reservation :', reservation);

    await this.prisma.vehicle.update({
      where: { id: reservation.vehicleId },
      data: { status: VehicleStatus.RENTED },
    });

    const payment = await this.prisma.payment.create({ data });

    if(payment.status === PaymentStatus.SUCCESS) {
        await this.prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: InvoiceStatus.PAID },
        });
      const customer = await this.prisma.user.findUnique({where: { id: reservation.customerId }});

      await this.mailerService.sendMail({
        to: customer?.email,
        subject: 'Votre facture a été payée',
        template: 'invoice',
        context: {
          customerName: customer?.firstName ?? 'Client',
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          paymentDate: new Date().toLocaleDateString('fr-FR'),
        },
      });

    }
    console.log('💳 Payment created end :', payment);
    return payment;
  }

  async createRefund(data: CreateRefundDto) {
    // Récupérer le paiement original
    const payment = await this.prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new Error('Can only refund successful payments');
    }

    if (!payment.transactionId) {
      throw new Error('No transaction ID found for this payment');
    }

    // Calculer le montant du remboursement
    const refundAmount = data.amount || payment.invoice?.amount || 0;

    // Créer le remboursement via Stripe
    const stripeRefund = await this.stripeService.createRefund(
      payment.transactionId,
      refundAmount,
      data.reason || RefundReason.REQUESTED_BY_CUSTOMER,
    );

    // Enregistrer le remboursement dans la base de données
    const refund = await this.prisma.payment.create({
      data: {
        invoiceId: payment.invoiceId,
        transactionId: stripeRefund.id,
        status: PaymentStatus.SUCCESS,
        method: payment.method,
      },
    });

    // Mettre à jour le statut de la facture
    await this.prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: InvoiceStatus.REFUNDED },
    });

    // Mettre à jour le statut de la réservation
    await this.reservationService.updateReservation(data.reservationId, {
      status: ReservationStatus.CANCELLED,
    });

    // Récupérer la réservation avec le client pour l'email
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: data.reservationId },
      include: { customer: true },
    });

    // Formater le montant du remboursement pour l'email (2 décimales maximum)
    const formattedRefundAmount = Math.round(refundAmount * 100) / 100;

    if (reservation?.customer?.email) {
      await this.mailerService.sendMail({
        to: reservation.customer.email,
        subject: 'Remboursement confirmé - Réservation annulée',
        template: 'refund-confirmation',
        context: {
          customerName: reservation.customer.firstName ?? 'Client',
          reservationId: data.reservationId,
          refundAmount: formattedRefundAmount,
          refundDate: new Date().toLocaleDateString('fr-FR'),
        },
      });
    }

    return {
      refund,
      stripeRefund,
      refundAmount: formattedRefundAmount,
      message: 'Remboursement effectué avec succès',
    };
  }

  async createRefundByInvoice(data: CreateRefundByInvoiceDto) {
    // Récupérer la facture avec les paiements et la réservation
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.PAID) {
      throw new Error('Invoice is not paid and cannot be refunded');
    }

    // Récupérer les paiements réussis pour cette facture
    const successfulPayments = await this.prisma.payment.findMany({
      where: {
        invoiceId: data.invoiceId,
        status: PaymentStatus.SUCCESS,
      },
      orderBy: { id: 'desc' },
    });

    if (successfulPayments.length === 0) {
      throw new Error('No successful payment found for this invoice');
    }

    const successfulPayment = successfulPayments[0];

    if (!invoice.reservationId) {
      throw new Error('Aucune réservation associée à cette facture');
    }

    // Utiliser la méthode existante createRefund
    return this.createRefund({
      paymentId: successfulPayment.id,
      reservationId: invoice.reservationId,
      amount: data.amount,
      reason: data.reason || RefundReason.REQUESTED_BY_CUSTOMER,
    });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.prisma.payment.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.payment.delete({ where: { id } });
  }
}
