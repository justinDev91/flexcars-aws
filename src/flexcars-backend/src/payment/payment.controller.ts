
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { CreatePaymentDto, PaymentStatus, ConfirmPaymentDto } from './dto/createPayment.dto';
import { CreateRefundDto, CreateRefundByInvoiceDto } from './dto/createRefund.dto';
import { UpdatePaymentDto } from './dto/updatePayment.dto';

import { PrismaService } from '../prisma.service';
import { PricingRuleService } from '../pricingrule/pricing.rule.service';
import { BadRequestException } from '@nestjs/common';

@ApiBearerAuth('access-token') 
@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly pricingRuleService: PricingRuleService,
  ) {}

  @Get('debug/payment-sync/:invoiceId')
  @ApiOperation({ summary: 'Debug payment synchronization issues' })
  async debugPaymentSync(@Param('invoiceId') invoiceId: string) {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] Diagnostic de synchronisation pour facture: ${invoiceId}`);

    try {
      // 1. Vérifier la facture
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { 
          reservation: true,
          payments: true
        }
      });

      if (!invoice) {
        return { error: 'Facture introuvable', invoiceId };
      }

      console.log(`📄 Facture ${invoiceId}:`, {
        status: invoice.status,
        amount: invoice.amount,
        paymentsCount: invoice.payments.length,
        reservationId: invoice.reservationId,
        reservationStatus: invoice.reservation?.status
      });

      // 2. Vérifier les paiements Stripe pour cette facture
      const payments = invoice.payments.map(p => ({
        id: p.id,
        transactionId: p.transactionId,
        status: p.status,
        method: p.method
      }));

      // 3. Vérifier l'état de la réservation et du véhicule
      const reservation = invoice.reservation;
      let vehicle: any = null;
      if (reservation) {
        vehicle = await this.prisma.vehicle.findUnique({
          where: { id: reservation.vehicleId }
        });
      }

      return {
        timestamp,
        invoice: {
          id: invoice.id,
          status: invoice.status,
          amount: invoice.amount,
          invoiceNumber: invoice.invoiceNumber
        },
        payments,
        reservation: reservation ? {
          id: reservation.id,
          status: reservation.status,
          totalPrice: reservation.totalPrice,
          vehicleId: reservation.vehicleId
        } : null,
        vehicle: vehicle ? {
          id: vehicle.id,
          status: vehicle.status,
          brand: vehicle.brand,
          model: vehicle.model
        } : null,
        diagnosis: {
          invoiceNeedsFix: invoice.status !== 'PAID' && payments.some(p => p.status === 'SUCCESS'),
          reservationNeedsFix: reservation && reservation.status !== 'CONFIRMED' && invoice.status === 'PAID',
          vehicleNeedsFix: vehicle && vehicle.status !== 'RENTED' && reservation?.status === 'CONFIRMED'
        }
      };

    } catch (error) {
      console.error(`❌ [${timestamp}] Erreur diagnostic:`, error);
      return { error: error.message, invoiceId, timestamp };
    }
  }

  @Post('debug/fix-payment-sync/:invoiceId')
  @ApiOperation({ summary: 'Fix payment synchronization for a specific invoice' })
  async fixPaymentSync(@Param('invoiceId') invoiceId: string) {
    const timestamp = new Date().toISOString();
    console.log(`🔧 [${timestamp}] Correction de synchronisation pour facture: ${invoiceId}`);

    try {
      // Récupérer les données
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { 
          reservation: true,
          payments: true
        }
      });

      if (!invoice) {
        return { error: 'Facture introuvable', invoiceId };
      }

      // Chercher un paiement réussi
      const successfulPayment = invoice.payments.find(p => p.status === 'SUCCESS');
      
      if (!successfulPayment) {
        return { error: 'Aucun paiement réussi trouvé', invoiceId };
      }

      const fixes: string[] = [];

      // Fix 1: Mettre à jour le statut de la facture
      if (invoice.status !== 'PAID') {
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'PAID' }
        });
        fixes.push('Facture mise à jour: PAID');
      }

      // Fix 2: Mettre à jour le statut de la réservation
      if (invoice.reservation && invoice.reservation.status !== 'CONFIRMED') {
        await this.prisma.reservation.update({
          where: { id: invoice.reservationId! },
          data: { status: 'CONFIRMED' }
        });
        fixes.push('Réservation mise à jour: CONFIRMED');
      }

      // Fix 3: Mettre à jour le statut du véhicule
      if (invoice.reservation) {
        const vehicle = await this.prisma.vehicle.findUnique({
          where: { id: invoice.reservation.vehicleId }
        });

        if (vehicle && vehicle.status !== 'RENTED') {
          await this.prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { status: 'RENTED' }
          });
          fixes.push('Véhicule mis à jour: RENTED');
        }
      }

      console.log(`✅ [${timestamp}] Corrections appliquées:`, fixes);
      
      return {
        success: true,
        invoiceId,
        fixes,
        timestamp
      };

    } catch (error) {
      console.error(`❌ [${timestamp}] Erreur correction:`, error);
      return { error: error.message, invoiceId, timestamp };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findById(@Param('id') id: string) {
    return this.paymentService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  async create(@Body() data: CreatePaymentDto) {
    return this.paymentService.create(data);
  }

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a Stripe payment intent for an invoice' })
  async createPaymentIntent(@Body() data: { invoiceId: string }) {
    console.log('🔍 DIAGNOSTIC PRIX - Création PaymentIntent pour facture:', data.invoiceId);
    
    // Récupérer la facture avec le montant réel
    let invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { reservation: true }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    console.log('🔍 DIAGNOSTIC PRIX - Invoice amount (DB):', invoice.amount, '€');

    if (invoice.status === 'PAID') {
      return {
        error: 'Cette facture est déjà payée',
        clientSecret: null,
        paymentIntentId: null,
        amount: invoice.amount,
      };
    }

    // Si la facture n'a pas de montant défini, le recalculer automatiquement
    if (!invoice.amount || invoice.amount === 0) {
      console.log('🔄 Recalcul du montant de la facture:', invoice.id);
      
      if (!invoice.reservation) {
        throw new BadRequestException('Aucune réservation associée à cette facture');
      }

      if (!invoice.reservation.startDatetime || !invoice.reservation.endDatetime) {
        throw new BadRequestException('Dates de réservation manquantes');
      }

      try {
        // Recalculer le prix total avec le service corrigé
        const totalPrice = await this.pricingRuleService.calculateTotalPrice(
          invoice.reservation.vehicleId,
          invoice.reservation.startDatetime.toISOString(),
          invoice.reservation.endDatetime.toISOString()
        );

        console.log('💰 Nouveau montant calculé:', totalPrice, '€ TTC');

        // Ajouter le car sitting si nécessaire
        let finalPrice = totalPrice;
        if (invoice.reservation.carSittingOption) {
          const carSittingCostTTC = 60; // 50€ HT + 20% TVA = 60€ TTC
          finalPrice += carSittingCostTTC;
          console.log('🚗 Car sitting ajouté:', carSittingCostTTC, '€ TTC → Total:', finalPrice, '€ TTC');
        }

        // Mettre à jour la facture avec le nouveau montant
        invoice = await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { amount: finalPrice },
          include: { reservation: true }
        });

        console.log('✅ Facture mise à jour avec le montant:', invoice.amount, '€ TTC');
      } catch (pricingError) {
        console.error('❌ Erreur lors du recalcul du prix:', pricingError);
        throw new Error('Impossible de calculer le montant de la facture. Contactez le support.');
      }
    }

    if (!invoice.amount || invoice.amount === 0) {
      throw new Error('Cette facture n\'a pas de montant défini. Contactez le support.');
    }
    
    const amountEUR = invoice.amount; // Montant en euros TTC
    console.log('🔍 DIAGNOSTIC PRIX - Montant à envoyer à Stripe:', amountEUR, '€ TTC');
    
    // Vérifier que la facture et la réservation existent
    if (!invoice.reservation) {
      throw new BadRequestException('Aucune réservation associée à cette facture');
    }

    if (!invoice.reservation.startDatetime || !invoice.reservation.endDatetime) {
      throw new BadRequestException('Dates de réservation manquantes');
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amountEUR, // En euros TTC
      'eur',
      {
        invoiceId: invoice.id,
        reservationId: invoice.reservationId || 'no-reservation',
        vehicleId: invoice.reservation.vehicleId,
        startDate: invoice.reservation.startDatetime.toISOString(),
        endDate: invoice.reservation.endDatetime.toISOString()
      }
    );

    console.log('🔍 DIAGNOSTIC PRIX - PaymentIntent créé:');
    console.log('  - Stripe amount (centimes):', paymentIntent.amount);
    console.log('  - Équivalent euros:', paymentIntent.amount / 100, '€');

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount, // Stripe retourne en centimes
    };
  }

  @Post('confirm-payment')
  @ApiOperation({ summary: 'Confirm payment by verifying with Stripe and updating database' })
  async confirmPayment(@Body() data: ConfirmPaymentDto) {
    const timestamp = new Date().toISOString();
    console.log(`🔐 [${timestamp}] Confirmation de paiement pour PaymentIntent: ${data.paymentIntentId}`);

    try {
      // 1. Vérifier le PaymentIntent auprès de Stripe
      const paymentIntent = await this.stripeService.confirmPaymentIntent(data.paymentIntentId);
      console.log(`📊 [${timestamp}] Statut PaymentIntent:`, paymentIntent.status);

      // 2. Vérifier que le paiement a réussi
      if (paymentIntent.status !== 'succeeded') {
        return {
          error: `Le paiement n'a pas réussi. Statut: ${paymentIntent.status}`,
          status: paymentIntent.status,
          paymentIntentId: data.paymentIntentId,
        };
      }

      // 3. Récupérer l'invoiceId depuis les métadonnées
      const invoiceId = paymentIntent.metadata?.invoiceId;
      if (!invoiceId) {
        return {
          error: 'Aucune facture associée à ce paiement',
          paymentIntentId: data.paymentIntentId,
        };
      }

      console.log(`📄 [${timestamp}] Facture associée: ${invoiceId}`);

      // 4. Vérifier si le paiement n'existe pas déjà
      const existingPayment = await this.prisma.payment.findFirst({
        where: { transactionId: data.paymentIntentId }
      });

      if (existingPayment) {
        console.log(`ℹ️ [${timestamp}] Paiement déjà existant pour ${data.paymentIntentId}`);
        return {
          success: true,
          message: 'Paiement déjà traité',
          paymentId: existingPayment.id,
          invoiceId,
        };
      }

      // 5. Utiliser la méthode existante pour créer le paiement
      const payment = await this.paymentService.create({
        invoiceId,
        transactionId: data.paymentIntentId,
        status: PaymentStatus.SUCCESS,
      });

      console.log(`✅ [${timestamp}] Paiement confirmé avec succès:`, payment.id);

      return {
        success: true,
        message: 'Paiement confirmé avec succès',
        paymentId: payment.id,
        invoiceId,
        paymentIntentId: data.paymentIntentId,
      };

    } catch (error) {
      console.error(`❌ [${timestamp}] Erreur lors de la confirmation:`, error);
      return {
        error: error.message,
        paymentIntentId: data.paymentIntentId,
      };
    }
  }

  @Post('refund')
  @ApiOperation({ summary: 'Create a refund for a payment' })
  async createRefund(@Body() data: CreateRefundDto) {
    return this.paymentService.createRefund(data);
  }

  @Post('refund-by-invoice')
  @ApiOperation({ summary: 'Create a refund using invoice ID (simplified API)' })
  async createRefundByInvoice(@Body() data: CreateRefundByInvoiceDto) {
    const result = await this.paymentService.createRefundByInvoice(data);
    return {
      refundId: result.stripeRefund.id,
      amount: result.refundAmount,
      status: 'success',
      message: result.message,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment' })
  async update(@Param('id') id: string, @Body() data: UpdatePaymentDto) {
    return this.paymentService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  async delete(@Param('id') id: string) {
    await this.paymentService.delete(id);
    return { message: 'Payment deleted successfully' };
  }




}
