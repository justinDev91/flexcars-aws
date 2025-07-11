"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieContextType {
  consent: CookieConsent;
  hasChosenConsent: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (category: CookieCategory, value: boolean) => void;
  saveConsent: (newConsent: CookieConsent) => void;
  resetConsent: () => void;
}

const defaultConsent: CookieConsent = {
  necessary: true, // Toujours actifs
  analytics: false,
  marketing: false,
  preferences: false,
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'flexcars-cookie-consent';
const COOKIE_CONSENT_DATE_KEY = 'flexcars-cookie-consent-date';

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [hasChosenConsent, setHasChosenConsent] = useState(false);

  // Charger les préférences depuis localStorage au montage
  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedDate = localStorage.getItem(COOKIE_CONSENT_DATE_KEY);
    
    if (savedConsent && savedDate) {
      try {
        const parsed = JSON.parse(savedConsent);
        const consentDate = new Date(savedDate);
        const now = new Date();
        const daysSinceConsent = (now.getTime() - consentDate.getTime()) / (1000 * 3600 * 24);
        
        // Les consentements expirent après 13 mois (RGPD)
        if (daysSinceConsent < 395) {
          setConsent(parsed);
          setHasChosenConsent(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences de cookies:', error);
      }
    }
  }, []);

  const saveConsentToStorage = (newConsent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    setConsent(newConsent);
    setHasChosenConsent(true);
  };

  const acceptAll = () => {
    const allAccepted: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsentToStorage(allAccepted);
  };

  const rejectAll = () => {
    const onlyNecessary: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsentToStorage(onlyNecessary);
  };

  const updateConsent = (category: CookieCategory, value: boolean) => {
    if (category === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    
    setConsent(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const saveConsent = (newConsent: CookieConsent) => {
    saveConsentToStorage({
      ...newConsent,
      necessary: true, // S'assurer que les cookies nécessaires restent activés
    });
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_CONSENT_DATE_KEY);
    setConsent(defaultConsent);
    setHasChosenConsent(false);
  };

  const value: CookieContextType = {
    consent,
    hasChosenConsent,
    acceptAll,
    rejectAll,
    updateConsent,
    saveConsent,
    resetConsent,
  };

  return (
    <CookieContext.Provider value={value}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookies doit être utilisé dans un CookieProvider');
  }
  return context;
} 