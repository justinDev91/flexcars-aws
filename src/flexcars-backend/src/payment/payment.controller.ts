
import { Controller, Get, Post, Put, Delete, Param, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { CreatePaymentDto, PaymentStatus } from './dto/createPayment.dto';
import { CreateRefundDto, CreateRefundByInvoiceDto } from './dto/createRefund.dto';
import { UpdatePaymentDto } from './dto/updatePayment.dto';
import { Public } from '../decorators/Public';
import { Request } from 'express';
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
    // Récupérer la facture avec le montant réel
    let invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { reservation: true }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

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

        console.log('💰 Nouveau montant calculé:', totalPrice);

        // Mettre à jour la facture avec le nouveau montant
        invoice = await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { amount: totalPrice },
          include: { reservation: true }
        });

        console.log('✅ Facture mise à jour avec le montant:', invoice.amount);
      } catch (pricingError) {
        console.error('❌ Erreur lors du recalcul du prix:', pricingError);
        throw new Error('Impossible de calculer le montant de la facture. Contactez le support.');
      }
    }

    if (!invoice.amount || invoice.amount === 0) {
      throw new Error('Cette facture n\'a pas de montant défini. Contactez le support.');
    }
    
    const amount = invoice.amount; // Utiliser le montant (recalculé si nécessaire)
    
    // Vérifier que la facture et la réservation existent
    if (!invoice.reservation) {
      throw new BadRequestException('Aucune réservation associée à cette facture');
    }

    if (!invoice.reservation.startDatetime || !invoice.reservation.endDatetime) {
      throw new BadRequestException('Dates de réservation manquantes');
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await this.stripeService.createPaymentIntent(
      invoice.amount,
      'eur',
      {
        invoiceId: invoice.id,
        reservationId: invoice.reservationId || 'no-reservation',
        vehicleId: invoice.reservation.vehicleId,
        startDate: invoice.reservation.startDatetime.toISOString(),
        endDate: invoice.reservation.endDatetime.toISOString()
      }
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    };
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

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const timestamp = new Date().toISOString();
    console.log(`🎯 [${timestamp}] Webhook Stripe reçu`);
    console.log('   • Body présent:', !!req.body);
    console.log('   • Signature présente:', !!signature);
    console.log('   • Type de body:', typeof req.body);
    
    try {
      let event;
      
      // Validation du webhook plus robuste
      try {
        console.log('🔐 Validation du webhook Stripe...');
        event = await this.stripeService.constructWebhookEvent(req.body, signature);
        console.log('✅ Webhook validé avec succès');
      } catch (webhookError) {
        console.error('❌ Erreur validation webhook:', {
          message: webhookError.message,
          type: webhookError.constructor.name
        });
        
        // En développement, essayer de traiter quand même le body si il semble valide
        if (process.env.NODE_ENV !== 'production' && req.body && typeof req.body === 'object' && req.body.type) {
          console.log('⚠️ Mode développement: traitement du webhook sans validation');
          event = req.body;
        } else {
          console.error('🚫 Webhook rejeté - validation échouée');
          return { error: 'Webhook validation failed', received: false };
        }
      }

      const eventType = event.type;
      const eventId = event.id;
      console.log(`📝 [${timestamp}] Événement: ${eventType} (ID: ${eventId})`);

      if (eventType === 'payment_intent.succeeded') {
        return await this.handlePaymentIntentSucceeded(event, timestamp);
      } else {
        console.log(`ℹ️ [${timestamp}] Événement ${eventType} ignoré`);
        return { received: true, processed: false, reason: 'Event type not handled' };
      }

    } catch (error) {
      console.error(`❌ [${timestamp}] Erreur webhook complète:`, {
        message: error.message,
        stack: error.stack,
        eventType: req.body?.type || 'unknown'
      });
      
      // Retourner 200 pour éviter les retry Stripe, mais avec l'erreur loggée
      return { error: error.message, received: true, processed: false };
    }
  }

  private async handlePaymentIntentSucceeded(event: any, timestamp: string) {
    const paymentIntent = event.data.object;
    const invoiceId = paymentIntent.metadata?.invoiceId;
    const paymentIntentId = paymentIntent.id;
    const amount = paymentIntent.amount_received;
    
    console.log(`💰 [${timestamp}] Payment Intent réussi:`);
    console.log(`   • PaymentIntent ID: ${paymentIntentId}`);
    console.log(`   • Invoice ID: ${invoiceId || 'MANQUANT'}`);
    console.log(`   • Montant: ${amount / 100}€`);
    console.log(`   • Métadonnées:`, paymentIntent.metadata);

    if (!invoiceId) {
      console.error(`⚠️ [${timestamp}] Pas d'invoiceId dans les métadonnées du PaymentIntent ${paymentIntentId}`);
      return { received: true, processed: false, reason: 'Missing invoiceId in metadata' };
    }

    try {
      // Vérifier si le payment existe déjà pour éviter les doublons
      const existingPayment = await this.prisma.payment.findFirst({
        where: { transactionId: paymentIntentId }
      });

      if (existingPayment) {
        console.log(`ℹ️ [${timestamp}] Paiement déjà existant pour ${paymentIntentId}, ignoré`);
        return { received: true, processed: false, reason: 'Payment already exists' };
      }

      // Vérifier que la facture existe
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { reservation: true }
      });

      if (!invoice) {
        console.error(`❌ [${timestamp}] Facture ${invoiceId} introuvable`);
        return { received: true, processed: false, reason: 'Invoice not found' };
      }

      console.log(`📄 [${timestamp}] Facture trouvée: ${invoice.id} (${invoice.status})`);

      // Créer le payment - cela va automatiquement mettre à jour la facture et la réservation
      console.log(`💾 [${timestamp}] Création du paiement...`);
      const payment = await this.paymentService.create({
        invoiceId,
        transactionId: paymentIntentId,
        status: PaymentStatus.SUCCESS,
      });

      console.log(`✅ [${timestamp}] Paiement créé avec succès:`);
      console.log(`   • Payment ID: ${payment.id}`);
      console.log(`   • Facture mise à jour: PAID`);
      console.log(`   • Réservation confirmée: CONFIRMED`);
      console.log(`   • Véhicule: RENTED`);

      return { 
        received: true, 
        processed: true, 
        paymentId: payment.id,
        invoiceId,
        reservationId: invoice.reservationId 
      };

    } catch (dbError) {
      console.error(`❌ [${timestamp}] Erreur base de données:`, {
        message: dbError.message,
        stack: dbError.stack,
        invoiceId,
        paymentIntentId
      });
      
      // En cas d'erreur DB, ne pas faire échouer le webhook mais logger l'erreur
      return { 
        received: true, 
        processed: false, 
        error: dbError.message,
        invoiceId,
        paymentIntentId 
      };
    }
  }
}
