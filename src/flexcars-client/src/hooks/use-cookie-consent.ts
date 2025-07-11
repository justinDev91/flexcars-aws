"use client";

import { useCookies } from '@/context/cookie-context';
import { useEffect } from 'react';

export function useCookieConsent() {
  const cookieContext = useCookies();

  // Méthodes pour vérifier les consentements spécifiques
  const canUseAnalytics = () => cookieContext.consent.analytics;
  const canUseMarketing = () => cookieContext.consent.marketing;
  const canUsePreferences = () => cookieContext.consent.preferences;

  // Méthodes pour initialiser les scripts tiers en fonction du consentement
  const initializeGoogleAnalytics = () => {
    if (canUseAnalytics() && typeof window !== 'undefined') {
      // Initialiser Google Analytics seulement si le consentement est donné
      console.log('🟢 Google Analytics initialisé avec consentement');
      // Ici, vous pourriez ajouter le code d'initialisation de GA
    }
  };

  const initializeFacebookPixel = () => {
    if (canUseMarketing() && typeof window !== 'undefined') {
      // Initialiser Facebook Pixel seulement si le consentement est donné
      console.log('🟢 Facebook Pixel initialisé avec consentement');
      // Ici, vous pourriez ajouter le code d'initialisation du Pixel
    }
  };

  // Méthodes pour nettoyer les cookies en cas de retrait du consentement
  const clearAnalyticsCookies = () => {
    if (typeof window !== 'undefined') {
      // Supprimer les cookies Google Analytics
      document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = '_ga_*=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('🔴 Cookies analytiques supprimés');
    }
  };

  const clearMarketingCookies = () => {
    if (typeof window !== 'undefined') {
      // Supprimer les cookies marketing
      document.cookie = 'fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = '_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('🔴 Cookies marketing supprimés');
    }
  };

  // Effet pour gérer les changements de consentement
  useEffect(() => {
    if (cookieContext.hasChosenConsent) {
      if (canUseAnalytics()) {
        initializeGoogleAnalytics();
      } else {
        clearAnalyticsCookies();
      }

      if (canUseMarketing()) {
        initializeFacebookPixel();
      } else {
        clearMarketingCookies();
      }
    }
  }, [cookieContext.consent, cookieContext.hasChosenConsent]);

  return {
    ...cookieContext,
    canUseAnalytics,
    canUseMarketing,
    canUsePreferences,
    initializeGoogleAnalytics,
    initializeFacebookPixel,
    clearAnalyticsCookies,
    clearMarketingCookies,
  };
} 