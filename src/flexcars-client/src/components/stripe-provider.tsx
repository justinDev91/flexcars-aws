"use client";

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useMemo, useEffect, useState } from 'react';

let stripeInstance: Promise<Stripe | null> | null = null;

const getStripeInstance = () => {
  if (!stripeInstance) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
      return Promise.resolve(null);
    }
    stripeInstance = loadStripe(publishableKey);
  }
  return stripeInstance;
};

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stripePromise = useMemo(() => {
    return getStripeInstance();
  }, []);

  const options = useMemo(() => {
    if (!clientSecret) return undefined;
    
    return {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '6px',
        },
      },
      loader: 'auto' as const,
    };
  }, [clientSecret]);

  useEffect(() => {
    stripePromise
      .then((stripe) => {
        if (!stripe) {
          setError('Impossible de charger Stripe');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement de Stripe:', err);
        setError('Erreur lors du chargement de Stripe');
        setIsLoading(false);
      });
  }, [stripePromise]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Chargement du système de paiement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
} 