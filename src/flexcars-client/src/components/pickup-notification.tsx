'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Car, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  Users,
  Key
} from 'lucide-react';

interface PickupNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleName: string;
  pickupType: 'normal' | 'carsitter';
  onViewReservations: () => void;
  onViewGuide: () => void;
}

export function PickupNotification({
  isVisible,
  onClose,
  vehicleName,
  pickupType,
  onViewReservations,
  onViewGuide
}: PickupNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`max-w-2xl w-full border-green-200 bg-green-50 transform transition-all duration-500 ${
        isAnimating ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'
      }`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-600" />
              {isAnimating && (
                <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800 flex items-center justify-center gap-2">
            <Car className="h-6 w-6" />
            {pickupType === 'carsitter' ? 'Demande de pickup envoyée !' : 'Pickup effectué !'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Statut du véhicule */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Véhicule : {vehicleName}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {pickupType === 'carsitter' ? 'En attente de validation' : 'Récupéré'}
              </Badge>
              {pickupType === 'carsitter' && (
                <div className="flex items-center gap-1 text-sm text-green-700">
                  <Clock className="h-4 w-4" />
                  <span>15-30 min</span>
                </div>
              )}
            </div>
          </div>

          {/* Message explicatif */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              {pickupType === 'carsitter' ? (
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              ) : (
                <Key className="h-5 w-5 text-blue-600 mt-0.5" />
              )}
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  {pickupType === 'carsitter' ? 'Prochaines étapes' : 'Félicitations !'}
                </h4>
                <p className="text-sm text-blue-700">
                  {pickupType === 'carsitter' 
                    ? 'Un carsitter va prendre en charge votre demande. Vous recevrez un email de confirmation dès que votre véhicule sera prêt.'
                    : 'Votre véhicule est maintenant à votre disposition. Vous pouvez maintenant profiter de votre location !'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onViewReservations}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Voir mes réservations
            </Button>
            <Button 
              onClick={onViewGuide}
              variant="outline"
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Guide du processus
            </Button>
          </div>

          {/* Informations supplémentaires */}
          <div className="text-center">
            <p className="text-sm text-green-600">
              {pickupType === 'carsitter' 
                ? 'Vous pouvez fermer cette notification et continuer à naviguer normalement.'
                : 'N\'oubliez pas de vérifier l\'état du véhicule avant de partir !'
              }
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="mt-2 text-green-600 hover:text-green-700"
            >
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 