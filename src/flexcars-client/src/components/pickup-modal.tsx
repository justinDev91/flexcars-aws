'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Clock, FileText, AlertCircle, CheckCircle2, Users, Car } from 'lucide-react';
import { addMinutes } from 'date-fns';
import { vehicleApi, carSitterApi } from '@/lib/api';
import { 
  Reservation, 
  Location, 
  DocumentCheck, 
  PickupAvailabilityCheck
} from '@/types/reservation';

interface PickupModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
}

interface CarSitter {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  currentLocationLat?: number;
  currentLocationLng?: number;
  distance?: number;
}

// Schéma de validation pour le pickup
const pickupSchema = z.object({
  pickupLocation: z.nativeEnum(Location),
  carSitterId: z.string().optional(),
});

type PickupFormValues = z.infer<typeof pickupSchema>;

const getLocationLabel = (location: Location): string => {
  const labels: Record<Location, string> = {
    [Location.PARIS_11]: 'Paris 11ème',
    [Location.PARIS_19]: 'Paris 19ème',
    [Location.ISSY_LES_MOULINEAUX]: 'Issy-les-Moulineaux',
    [Location.BOULOGNE]: 'Boulogne-Billancourt',
    [Location.SAINT_DENIS]: 'Saint-Denis',
  };
  return labels[location] || location;
};

export function PickupModal({ reservation, isOpen, onClose }: PickupModalProps) {
  const [loading, setLoading] = useState(false);
  const [documentCheck, setDocumentCheck] = useState<DocumentCheck | null>(null);
  const [availabilityCheck, setAvailabilityCheck] = useState<PickupAvailabilityCheck | null>(null);
  const [availableCarSitters, setAvailableCarSitters] = useState<CarSitter[]>([]);
  const [loadingCarSitters, setLoadingCarSitters] = useState(false);
  const [pickupType, setPickupType] = useState<'normal' | 'carsitter'>('normal');
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PickupFormValues>({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      pickupLocation: reservation.pickupLocation || Location.SAINT_DENIS,
      carSitterId: '',
    },
  });

  const checkDocumentsAndAvailability = useCallback(async () => {
    try {
      setLoading(true);
      
      // Vérifier les documents
      const docResponse = await vehicleApi.checkUserDocuments(reservation.customerId);
      setDocumentCheck(docResponse.data as DocumentCheck);
      
      // Vérifier la disponibilité pour pickup
      const availResponse = await vehicleApi.canPickup(reservation.id);
      setAvailabilityCheck(availResponse.data as PickupAvailabilityCheck);
      
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast.error('Erreur lors de la vérification des conditions de pickup');
    } finally {
      setLoading(false);
    }
  }, [reservation.customerId, reservation.id]);

  // Vérifier les documents et disponibilité au chargement
  useEffect(() => {
    if (isOpen && reservation.customer?.id) {
      checkDocumentsAndAvailability();
    }
  }, [isOpen, reservation.customer?.id, checkDocumentsAndAvailability]);

  // Charger les car sitters disponibles si l'option est sélectionnée
  useEffect(() => {
    if (pickupType === 'carsitter' && reservation.carSittingOption) {
      loadAvailableCarSitters();
    }
  }, [pickupType, reservation.carSittingOption]);

  const loadAvailableCarSitters = async () => {
    try {
      setLoadingCarSitters(true);
      const response = await carSitterApi.getAllAvailable();
      setAvailableCarSitters((response.data as CarSitter[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des car sitters:', error);
      toast.error('Erreur lors du chargement des car sitters disponibles');
    } finally {
      setLoadingCarSitters(false);
    }
  };

  const handlePickupTypeChange = (type: 'normal' | 'carsitter') => {
    if (type === 'carsitter' && !reservation.carSittingOption) {
      toast.error('L\'option car sitting n\'était pas activée lors de votre réservation');
      return;
    }
    setPickupType(type);
  };

  const handleSubmit = async (data: PickupFormValues) => {
    if (!documentCheck?.canPickup) {
      toast.error('Documents requis manquants');
      return;
    }

    if (!availabilityCheck?.canPickup) {
      toast.error(availabilityCheck?.message || 'Pickup non disponible');
      return;
    }

    try {
      setLoading(true);
      setIsProcessing(true);
      
      // Afficher un message de traitement
      toast.info('Traitement de votre demande de pickup...');
      
      if (pickupType === 'carsitter' && data.carSitterId) {
        const pickupData = {
          reservationId: reservation.id,
          carSitterId: data.carSitterId,
          requestedTime: new Date(reservation.startDatetime).toISOString(),
          pickupLocation: data.pickupLocation,
        };
        await vehicleApi.pickupWithCarSitter(pickupData);
      } else {
        const pickupData = {
          reservationId: reservation.id,
          requestedTime: new Date(reservation.startDatetime).toISOString(),
          pickupLocation: data.pickupLocation,
        };
        await vehicleApi.pickupNormal(pickupData);
      }

      // Afficher un message de succès avant redirection
      toast.success('Pickup effectué avec succès ! Redirection...');
      
      // Délai court pour permettre à l'utilisateur de voir le message
      setTimeout(() => {
        // Rediriger vers la page de confirmation au lieu de faire un rechargement brutal
        const typeParam = pickupType === 'carsitter' ? 'carsitter' : 'normal';
        window.location.href = `/pickup/success?reservationId=${reservation.id}&pickupType=${typeParam}`;
      }, 1000);
      
      // Fermer le modal après un délai
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Erreur lors du pickup:', error);
      toast.error('Erreur lors de la demande de pickup');
      setIsProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = useMemo(() => {
    return documentCheck?.canPickup && availabilityCheck?.canPickup;
  }, [documentCheck, availabilityCheck]);

  const nextPickupTime = useMemo(() => {
    if (availabilityCheck?.minutesUntilPickup) {
      const now = new Date();
      return addMinutes(now, availabilityCheck.minutesUntilPickup);
    }
    return null;
  }, [availabilityCheck]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Récupération du véhicule
          </DialogTitle>
          <DialogDescription>
            Récupérez votre véhicule {reservation.vehicle?.brand} {reservation.vehicle?.model}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vérification des documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vérification des documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {documentCheck?.hasDriverLicense ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      Permis de conduire {documentCheck?.hasDriverLicense ? 'présent' : 'manquant'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {documentCheck?.hasIdCard ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      Carte d'identité {documentCheck?.hasIdCard ? 'présente' : 'manquante'}
                    </span>
                  </div>
                  
                  {!documentCheck?.canPickup && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        Vous devez avoir un permis de conduire et une carte d'identité pour récupérer le véhicule.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vérification de la disponibilité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Disponibilité
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availabilityCheck ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {availabilityCheck.canPickup ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                    <span className="text-sm">{availabilityCheck.message}</span>
                  </div>
                  
                  {nextPickupTime && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Pickup disponible le{' '}
                        {nextPickupTime.toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire de pickup */}
          {canProceed && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Type de pickup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Type de récupération</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          pickupType === 'normal' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePickupTypeChange('normal')}
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5" />
                          <span className="font-medium">Pickup normal</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Récupérer le véhicule au lieu de départ
                        </p>
                      </div>
                      
                      {reservation.carSittingOption && (
                        <div
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            pickupType === 'carsitter' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handlePickupTypeChange('carsitter')}
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span className="font-medium">Avec carsitter</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Faire livrer le véhicule par un carsitter
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lieu de pickup */}
                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu de récupération</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un lieu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Location).map((location) => (
                            <SelectItem key={location} value={location}>
                              {getLocationLabel(location)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sélection du car sitter */}
                {pickupType === 'carsitter' && (
                  <FormField
                    control={form.control}
                    name="carSitterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car sitter</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un car sitter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingCarSitters ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              </div>
                            ) : (
                              availableCarSitters.map((carSitter) => (
                                <SelectItem key={carSitter.id} value={carSitter.id}>
                                  {carSitter.user.firstName} {carSitter.user.lastName}
                                  {carSitter.distance && (
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({carSitter.distance.toFixed(1)} km)
                                    </span>
                                  )}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={loading || !canProceed || isProcessing}
                    className={`flex-1 transition-all duration-200 ${
                      isProcessing 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : loading 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : ''
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 animate-pulse" />
                        Succès ! Redirection...
                      </>
                    ) : loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Car className="h-4 w-4 mr-2" />
                        Demander le pickup
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 