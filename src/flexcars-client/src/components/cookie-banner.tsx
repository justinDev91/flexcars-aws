"use client";

import React, { useState } from 'react';
import { useCookies } from '@/context/cookie-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';
import { CookiePreferencesModal } from '@/components/cookie-preferences-modal';
import Link from 'next/link';

export function CookieBanner() {
  const { hasChosenConsent, acceptAll, rejectAll } = useCookies();
  const [isVisible, setIsVisible] = useState(!hasChosenConsent);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isVisible || hasChosenConsent) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setIsVisible(false);
  };

  const handlePersonalize = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Si le modal se ferme après avoir choisi, cacher la bannière
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t shadow-lg">
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                🍪 Gestion des cookies et protection des données
              </h3>
              
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                FlexCars utilise des cookies pour améliorer votre expérience de navigation, 
                analyser le trafic et personnaliser le contenu. Nous respectons votre vie privée 
                et vous laissons le contrôle sur vos données.
              </p>
              
              <div className="text-xs text-muted-foreground mb-4">
                <span>En poursuivant votre navigation, vous acceptez notre </span>
                <Link 
                  href="/legal/politique-cookies" 
                  className="text-primary hover:underline font-medium"
                >
                  politique de cookies
                </Link>
                <span> et notre </span>
                <Link 
                  href="/legal/politique-confidentialite" 
                  className="text-primary hover:underline font-medium"
                >
                  politique de confidentialité
                </Link>
                <span>.</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleAcceptAll}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  Accepter tout
                </Button>
                
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  size="sm"
                >
                  Cookies essentiels uniquement
                </Button>
                
                <Button 
                  onClick={handlePersonalize}
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Personnaliser
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <CookiePreferencesModal 
        open={isModalOpen} 
        onOpenChange={handleModalClose} 
      />
    </div>
  );
} 