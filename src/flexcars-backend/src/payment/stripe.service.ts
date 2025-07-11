import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'eur', metadata?: Record<string, string>) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  // Nouvelles méthodes pour les remboursements
  async createRefund(paymentIntentId: string, amount?: number, reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer') {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Remboursement partiel ou complet
      reason: reason || 'requested_by_customer',
    });
  }

  async getRefund(refundId: string) {
    return this.stripe.refunds.retrieve(refundId);
  }

  async listRefunds(paymentIntentId: string) {
    return this.stripe.refunds.list({
      payment_intent: paymentIntentId,
    });
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string) {
    let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // En développement avec Stripe CLI, utiliser la clé temporaire si disponible
    if (process.env.NODE_ENV !== 'production') {
      // Clé temporaire générée par `stripe listen`
      const stripeCliSecret = 'whsec_fc360f9f5524c3781b67013440b6919151080fe8b8e467d150afa3ab385fe0ce';
      webhookSecret = stripeCliSecret;
    }
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }
    
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
} 