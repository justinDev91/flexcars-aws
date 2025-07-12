"use client";

import { useState, useMemo, useCallback } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { paymentApi } from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  invoiceId: string;
  onSuccess?: () => void;
  onError?: () => void;
  paymentType?: 'late_fees' | 'penalty' | null;
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  invoiceId,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Formatage du montant pour l'affichage
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100);

  // Calcul de la TVA pour l'affichage
  const amountTTC = amount / 100; // Conversion centimes → euros
  const amountHT = Math.round((amountTTC / 1.2) * 100) / 100; // TTC → HT
  const vatAmount = Math.round((amountTTC - amountHT) * 100) / 100; // TVA

  const invoiceNumber = useMemo(() => {
    return invoiceId.slice(-8);
  }, [invoiceId]);

  const paymentElementOptions = useMemo(() => ({
    layout: {
      type: 'tabs' as const,
      defaultCollapsed: false,
    },
    paymentMethodOrder: ['card'],
    fields: {
      billingDetails: 'auto' as const,
    },
    terms: {
      card: 'never' as const,
    },
    wallets: {
      applePay: 'never' as const,
      googlePay: 'never' as const,
    }
  }), []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Étape 1: Confirmer le paiement avec Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('error');
        toast.error(`Erreur de paiement: ${error.message}`);
        onError?.();
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Étape 2: Confirmer le paiement côté backend
        try {
          const confirmResponse = await paymentApi.confirmPayment(paymentIntent.id);
          
          if (confirmResponse.data.success) {
            setPaymentStatus('success');
            toast.success('Paiement effectué avec succès !');
            onSuccess?.();
            // 🔥 IMPORTANT : Fermer le modal après un délai court pour laisser voir le succès
            setTimeout(() => {
              onClose();
            }, 2000);
          } else {
            setPaymentStatus('error');
            toast.error(`Erreur lors de la confirmation: ${confirmResponse.data.error}`);
            onError?.();
          }
        } catch {
          setPaymentStatus('error');
          toast.error('Erreur lors de la confirmation du paiement. Veuillez contacter le support.');
          onError?.();
        }
      } else {
        setPaymentStatus('error');
        toast.error('Le paiement n\'a pas été confirmé');
        onError?.();
      }
    } catch {
      setPaymentStatus('error');
      toast.error('Erreur lors du traitement du paiement');
      onError?.();
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, isProcessing, onSuccess, onClose, onError]);

  const handleRetry = useCallback(() => {
    setPaymentStatus('idle');
  }, []);

  const renderContent = useMemo(() => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Paiement réussi !</h3>
            <p className="text-gray-600">
              Votre paiement de {formattedAmount} a été traité avec succès.
            </p>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erreur de paiement</h3>
            <p className="text-gray-600 mb-4">
              Une erreur s&apos;est produite lors du traitement de votre paiement.
            </p>
            <Button onClick={handleRetry} variant="outline">
              Réessayer
            </Button>
          </div>
        );
      
      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Montant à payer TTC :</span>
                <span className="text-lg font-semibold">{formattedAmount}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Facture :</span>
                <span className="text-sm text-gray-800">#{invoiceNumber}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                (dont {vatAmount}€ de TVA)
              </div>
            </div>

            <div className="space-y-4">
              <PaymentElement options={paymentElementOptions} />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                disabled={!stripe || !elements || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer {formattedAmount} TTC
                  </>
                )}
              </Button>
            </div>
          </form>
        );
    }
  }, [paymentStatus, formattedAmount, handleSubmit, handleRetry, onClose, stripe, elements, isProcessing, invoiceNumber, vatAmount, paymentElementOptions]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement sécurisé
          </DialogTitle>
          <DialogDescription>
            Effectuez votre paiement de manière sécurisée avec Stripe
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {renderContent}
        </div>
      </DialogContent>
    </Dialog>
  );
} 