"use client";

import React, { useState, useEffect } from 'react';
import { useCookies, CookieConsent, CookieCategory } from '@/context/cookie-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  BarChart3, 
  Target, 
  Settings, 
  Info,
  Cookie
} from 'lucide-react';

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiePreferencesModal({ open, onOpenChange }: CookiePreferencesModalProps) {
  const { consent, updateConsent, saveConsent, acceptAll, rejectAll } = useCookies();
  const [localConsent, setLocalConsent] = useState<CookieConsent>(consent);

  useEffect(() => {
    setLocalConsent(consent);
  }, [consent]);

  const handleToggle = (category: CookieCategory, value: boolean) => {
    if (category === 'necessary') return;
    setLocalConsent(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSave = () => {
    saveConsent(localConsent);
    // Fermer le modal après sauvegarde
    setTimeout(() => onOpenChange(false), 100);
  };

  const handleAcceptAll = () => {
    acceptAll();
    // Fermer le modal après acceptation
    setTimeout(() => onOpenChange(false), 100);
  };

  const handleRejectAll = () => {
    rejectAll();
    // Fermer le modal après refus
    setTimeout(() => onOpenChange(false), 100);
  };

  const cookieCategories = [
    {
      id: 'necessary' as CookieCategory,
      title: 'Cookies strictement nécessaires',
      icon: Shield,
      description: 'Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.',
      details: [
        'Authentification et sécurité',
        'Panier et processus de commande',
        'Préférences de navigation',
        'Protection contre la fraude'
      ],
      required: true,
    },
    {
      id: 'analytics' as CookieCategory,
      title: 'Cookies analytiques',
      icon: BarChart3,
      description: 'Ces cookies nous aident à comprendre comment vous utilisez notre site pour l\'améliorer.',
      details: [
        'Mesure d\'audience et statistiques',
        'Analyse du comportement utilisateur',
        'Optimisation des performances',
        'Tests A/B et améliorations'
      ],
      required: false,
    },
    {
      id: 'marketing' as CookieCategory,
      title: 'Cookies marketing',
      icon: Target,
      description: 'Ces cookies permettent de vous proposer des publicités et offres personnalisées.',
      details: [
        'Publicité ciblée',
        'Retargeting et remarketing',
        'Mesure d\'efficacité publicitaire',
        'Réseaux sociaux et partenaires'
      ],
      required: false,
    },
    {
      id: 'preferences' as CookieCategory,
      title: 'Cookies de préférences',
      icon: Settings,
      description: 'Ces cookies sauvegardent vos préférences pour personnaliser votre expérience.',
      details: [
        'Langue et région',
        'Thème et apparence',
        'Filtres et tri sauvegardés',
        'Préférences de notification'
      ],
      required: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Cookie className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">
              Centre de gestion des cookies
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Contrôlez l'utilisation des cookies sur FlexCars. Vous pouvez activer ou désactiver 
            différentes catégories de cookies selon vos préférences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Information importante</p>
                <p>
                  Vos préférences sont conservées pendant 13 mois conformément au RGPD. 
                  Vous pouvez les modifier à tout moment en accédant à ce centre de préférences.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              const isEnabled = localConsent[category.id];
              
              return (
                <Card key={category.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          {category.required && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Obligatoire
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={category.id}
                          checked={isEnabled}
                          onCheckedChange={(checked) => handleToggle(category.id, checked)}
                          disabled={category.required}
                        />
                        <Label 
                          htmlFor={category.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {isEnabled ? 'Activé' : 'Désactivé'}
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Utilisés pour :</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.details.map((detail, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button 
              onClick={handleSave}
              className="flex-1 min-w-[150px]"
            >
              Sauvegarder mes préférences
            </Button>
            <Button 
              onClick={handleAcceptAll}
              variant="outline"
              className="flex-1 min-w-[150px]"
            >
              Accepter tout
            </Button>
            <Button 
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1 min-w-[150px]"
            >
              Refuser tout (sauf obligatoires)
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Pour plus d'informations sur notre utilisation des cookies, consultez notre{' '}
            <a 
              href="/legal/politique-cookies" 
              className="text-primary hover:underline"
              target="_blank"
            >
              politique de cookies
            </a>
            {' '}et notre{' '}
            <a 
              href="/legal/politique-confidentialite" 
              className="text-primary hover:underline"
              target="_blank"
            >
              politique de confidentialité
            </a>
            .
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 