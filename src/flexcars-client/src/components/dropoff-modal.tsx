"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  MapPin, 
  Loader2, 
  Car, 
  AlertTriangle,
  Users,
  Clock
} from 'lucide-react';

import { Reservation } from '@/types/reservation';
import { DropoffResponse } from '@/types/vehicle';
import { vehicleApi, carSitterApi, paymentApi } from '@/lib/api';
import { PaymentModal } from './payment-modal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Schémas de validation simplifiés
const dropoffSchemas = {
  normal: z.object({
    currentMileage: z.number().min(0, "Le kilométrage doit être positif"),
    hasAccident: z.boolean(),
  }),
  carsitter: z.object({
    currentMileage: z.number().min(0, "Le kilométrage doit être positif"),
    hasAccident: z.boolean(),
    carSitterId: z.string().min(1, "Veuillez sélectionner un carsitter"),
    signature: z.string().optional(),
  })
};

type DropoffNormalFormData = {
  currentMileage: number;
  hasAccident: boolean;
};

type DropoffCarSitterFormData = {
  currentMileage: number;
  hasAccident: boolean;
  carSitterId: string;
  signature?: string;
};

interface DropoffModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CarSitter {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
}

interface DropoffFormData {
  currentMileage: number;
  hasAccident: boolean;
  carSitterId?: string;
  signature?: string;
  dropoffTime: string;
}

export function DropoffModal({ reservation, isOpen, onClose, onSuccess }: DropoffModalProps) {
  const [dropoffType, setDropoffType] = useState<'normal' | 'carsitter'>('normal');
  const [availableCarSitters, setAvailableCarSitters] = useState<CarSitter[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCarSitters, setLoadingCarSitters] = useState(false);

  // États pour les calculs automatiques
  const [lateFees, setLateFees] = useState(0);
  const [lateHours, setLateHours] = useState(0);

  // États pour la gestion des pénalités
  const [showPenaltyPayment, setShowPenaltyPayment] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [penaltyInvoiceId, setPenaltyInvoiceId] = useState<string | null>(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [pendingDropoffData, setPendingDropoffData] = useState<DropoffFormData | null>(null);

  // Fonction pour gérer le changement de type de dropoff
  const handleDropoffTypeChange = (newType: 'normal' | 'carsitter') => {
    if (newType === 'carsitter' && !reservation.carSittingOption) {
      toast.error('L\'option car sitting n\'était pas activée lors de votre réservation');
      return;
    }
    setDropoffType(newType);
  };

  // Formulaires
  const normalForm = useForm<DropoffNormalFormData>({
    resolver: zodResolver(dropoffSchemas.normal),
    defaultValues: {
      currentMileage: reservation.vehicle?.currentMileage || 0,
      hasAccident: false,
    },
  });

  const carSitterForm = useForm<DropoffCarSitterFormData>({
    resolver: zodResolver(dropoffSchemas.carsitter),
    defaultValues: {
      currentMileage: reservation.vehicle?.currentMileage || 0,
      hasAccident: false,
      carSitterId: '',
    },
  });

  // Calculer les frais de retard automatiquement pour l'heure actuelle
  const calculateCurrentLateFees = useCallback(() => {
    const now = new Date();
    const endDate = new Date(reservation.endDatetime);
    
    if (now > endDate) {
      const hoursLate = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60));
      const hourlyRate = 25; // 25€ par heure de retard
      const fees = hoursLate * hourlyRate;
      
      setLateFees(fees);
      setLateHours(hoursLate);
      
      return {
        isLate: true,
        hoursLate,
        fees,
        message: `Retard de ${hoursLate} heure(s). Frais supplémentaires : ${fees}€ TTC`
      };
    }
    
    setLateFees(0);
    setLateHours(0);
    return { isLate: false, hoursLate: 0, fees: 0, message: '' };
  }, [reservation.endDatetime]);

  // Calculer les frais de retard au montage du composant
  useEffect(() => {
    calculateCurrentLateFees();
  }, [calculateCurrentLateFees]);

  // Charger les carsitters disponibles
  const loadAvailableCarSitters = useCallback(async () => {
    if (!reservation.carSittingOption) return;

    setLoadingCarSitters(true);
    try {
      const response = await carSitterApi.getAllAvailable();
      setAvailableCarSitters((response.data as CarSitter[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des carsitters:', error);
      toast.error('Erreur lors du chargement des carsitters');
    } finally {
      setLoadingCarSitters(false);
    }
  }, [reservation.carSittingOption]);

  // Charger les carsitters disponibles
  useEffect(() => {
    if (dropoffType === 'carsitter') {
      loadAvailableCarSitters();
    }
  }, [dropoffType, loadAvailableCarSitters]);

  // Gérer le paiement des pénalités
  const handlePenaltyPayment = async () => {
    if (!penaltyInvoiceId) return;

    try {
      const response = await paymentApi.createPaymentIntent(penaltyInvoiceId);
      if (response.data.error || !response.data.clientSecret) {
        toast.error(response.data.error || 'Impossible de créer l\'intention de paiement');
        return;
      }

      setPaymentClientSecret(response.data.clientSecret);
      setShowPenaltyPayment(true);
    } catch (error) {
      console.error('Erreur lors de la création de l\'intention de paiement:', error);
      toast.error('Erreur lors de la préparation du paiement');
    }
  };

  // Après le paiement des pénalités, finaliser le dropoff
  const handlePenaltyPaymentSuccess = async () => {
    setShowPenaltyPayment(false);
    setPaymentClientSecret(null);
    
    // Finaliser le dropoff en fonction du type
    if (pendingDropoffData) {
      try {
        if (dropoffType === 'normal') {
          await finalizePaidDropoff(pendingDropoffData);
        } else {
          await finalizePaidCarSitterDropoff(pendingDropoffData);
        }
        
        toast.success('Pénalité payée et véhicule rendu avec succès !');
        onSuccess();
        onClose();
      } catch (error) {
        console.error('Erreur lors de la finalisation du dropoff après paiement:', error);
        toast.error('Erreur lors de la finalisation du dropoff');
      }
    }
    
    setPendingDropoffData(null);
  };

  // Finaliser le dropoff après paiement de la pénalité
  const finalizePaidDropoff = async (data: DropoffFormData) => {
    const location = currentLocation || { lat: 0, lng: 0 };
    
    const response = await vehicleApi.dropoffNormal({
      reservationId: reservation.id,
      currentMileage: data.currentMileage,
      hasAccident: data.hasAccident,
      currentLocationLat: location.lat,
      currentLocationLng: location.lng,
      dropoffTime: data.dropoffTime
    });

    return response.data;
  };

  // Finaliser le dropoff avec carsitter après paiement de la pénalité
  const finalizePaidCarSitterDropoff = async (data: DropoffFormData) => {
    const location = currentLocation || { lat: 0, lng: 0 };
    
    const response = await vehicleApi.dropoffWithCarSitter({
      reservationId: reservation.id,
      carSitterId: data.carSitterId!,
      currentMileage: data.currentMileage,
      hasAccident: data.hasAccident,
      currentLocationLat: location.lat,
      currentLocationLng: location.lng,
      dropoffTime: data.dropoffTime
    });

    return response.data;
  };

  // Gestion du dropoff normal
  const handleNormalDropoff = async (data: DropoffNormalFormData) => {
    setLoading(true);
    try {
      // Calculer l'heure actuelle pour le dropoff
      const now = new Date();
      const dropoffTime = now.toISOString();

      // Effectuer le dropoff
      await performFinalDropoff({ ...data, dropoffTime });
      
    } catch (error) {
      console.error('Erreur lors du dropoff normal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du dropoff';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Effectuer le dropoff final
  const performFinalDropoff = async (data: DropoffNormalFormData & { dropoffTime: string }) => {
    try {
      if (!currentLocation) {
        // Obtenir la localisation actuelle
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCurrentLocation(location);
              completeDropoff(data, location);
            },
            (error) => {
              console.error('Erreur géolocalisation:', error);
              // Utiliser une position par défaut si la géolocalisation échoue
              const defaultLocation = { lat: 48.8566, lng: 2.3522 };
              setCurrentLocation(defaultLocation);
              completeDropoff(data, defaultLocation);
            }
          );
        } else {
          const defaultLocation = { lat: 48.8566, lng: 2.3522 };
          setCurrentLocation(defaultLocation);
          completeDropoff(data, defaultLocation);
        }
      } else {
        completeDropoff(data, currentLocation);
      }
    } catch (error) {
      console.error('Erreur lors du dropoff:', error);
      throw error;
    }
  };

  const completeDropoff = async (data: DropoffNormalFormData & { dropoffTime: string }, location: { lat: number; lng: number }) => {
    try {
      const response = await vehicleApi.dropoffNormal({
        reservationId: reservation.id,
        currentMileage: data.currentMileage,
        hasAccident: data.hasAccident,
        currentLocationLat: location.lat,
        currentLocationLng: location.lng,
        dropoffTime: data.dropoffTime
      });

      const result = response.data as DropoffResponse;
      
      // Vérifier s'il y a des pénalités à payer
      if (result.needsPayment && result.penaltyAmount && result.penaltyInvoiceId) {
        setPenaltyAmount(result.penaltyAmount);
        setPenaltyInvoiceId(result.penaltyInvoiceId);
        const dropoffData: DropoffFormData = {
          currentMileage: data.currentMileage,
          hasAccident: data.hasAccident,
          dropoffTime: data.dropoffTime
        };
        setPendingDropoffData(dropoffData);
        
        // Afficher le modal de paiement des pénalités
        await handlePenaltyPayment();
      } else {
        // Pas de pénalité, dropoff terminé
        toast.success('Véhicule rendu avec succès !');
        onSuccess();
        onClose();
      }
      
    } catch (error) {
      console.error('Erreur lors du dropoff:', error);
      throw error;
    }
  };

  // Gestion du dropoff avec carsitter
  const handleCarSitterDropoff = async (data: DropoffCarSitterFormData) => {
    setLoading(true);
    try {
      // Calculer l'heure actuelle pour le dropoff
      const now = new Date();
      const dropoffTime = now.toISOString();

      // Effectuer le dropoff avec carsitter
      await performFinalCarSitterDropoff({ ...data, dropoffTime });
      
    } catch (error) {
      console.error('Erreur lors du dropoff avec carsitter:', error);
      // Extraire le message d'erreur depuis la réponse API
      let errorMessage = 'Erreur lors du dropoff';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const response = error.response as { data?: { message?: string } };
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Effectuer le dropoff final avec carsitter
  const performFinalCarSitterDropoff = async (data: DropoffCarSitterFormData & { dropoffTime: string }) => {
    try {
      if (!currentLocation) {
        // Obtenir la localisation actuelle
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCurrentLocation(location);
              completeCarSitterDropoff(data, location);
            },
            (error) => {
              console.error('Erreur géolocalisation:', error);
              // Utiliser une position par défaut si la géolocalisation échoue
              const defaultLocation = { lat: 48.8566, lng: 2.3522 };
              setCurrentLocation(defaultLocation);
              completeCarSitterDropoff(data, defaultLocation);
            }
          );
        } else {
          const defaultLocation = { lat: 48.8566, lng: 2.3522 };
          setCurrentLocation(defaultLocation);
          completeCarSitterDropoff(data, defaultLocation);
        }
      } else {
        completeCarSitterDropoff(data, currentLocation);
      }
    } catch (error) {
      console.error('Erreur lors du dropoff:', error);
      throw error;
    }
  };

  const completeCarSitterDropoff = async (data: DropoffCarSitterFormData & { dropoffTime: string }, location: { lat: number; lng: number }) => {
    try {
      const response = await vehicleApi.dropoffWithCarSitter({
        reservationId: reservation.id,
        carSitterId: data.carSitterId,
        currentMileage: data.currentMileage,
        hasAccident: data.hasAccident,
        currentLocationLat: location.lat,
        currentLocationLng: location.lng,
        dropoffTime: data.dropoffTime
      });

      const result = response.data as DropoffResponse;
      
      // Vérifier s'il y a des pénalités à payer
      if (result.needsPayment && result.penaltyAmount && result.penaltyInvoiceId) {
        setPenaltyAmount(result.penaltyAmount);
        setPenaltyInvoiceId(result.penaltyInvoiceId);
        const dropoffData: DropoffFormData = {
          currentMileage: data.currentMileage,
          hasAccident: data.hasAccident,
          carSitterId: data.carSitterId,
          dropoffTime: data.dropoffTime
        };
        setPendingDropoffData(dropoffData);
        
        // Afficher le modal de paiement des pénalités
        await handlePenaltyPayment();
      } else {
        // Pas de pénalité, dropoff terminé
        toast.success('Demande de dropoff avec carsitter créée avec succès !');
        onSuccess();
        onClose();
      }
      
    } catch (error) {
      console.error('Erreur lors du dropoff:', error);
      throw error;
    }
  };

  // Réinitialiser la modal
  const resetModal = () => {
    setDropoffType('normal');
    setAvailableCarSitters([]);
    setCurrentLocation(null);
    setLoading(false);
    setLoadingCarSitters(false);
    setLateFees(0);
    setLateHours(0);
    
    // Réinitialiser les états des pénalités
    setShowPenaltyPayment(false);
    setPenaltyAmount(0);
    setPenaltyInvoiceId(null);
    setPaymentClientSecret(null);
    setPendingDropoffData(null);
    
    normalForm.reset();
    carSitterForm.reset();
  };

  // Gérer la fermeture
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Calculer l'heure prévue de fin
  const endTime = new Date(reservation.endDatetime);
  const now = new Date();
  const isOverdue = now > endTime;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Rendre le véhicule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de la réservation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Réservation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Véhicule</p>
                  <p className="font-medium">{reservation.vehicle?.brand} {reservation.vehicle?.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plaque</p>
                  <p className="font-medium">{reservation.vehicle?.plateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Début de location</p>
                  <p className="font-medium">{new Date(reservation.startDatetime).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fin prévue</p>
                  <p className="font-medium">{endTime.toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Option Car Sitting</p>
                  <p className="font-medium">{reservation.carSittingOption ? 'Activée' : 'Non activée'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerte de retard */}
          {isOverdue && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Retard détecté</AlertTitle>
              <AlertDescription>
                <p>Vous êtes en retard de {lateHours} heure(s).</p>
                <p className="font-medium">Des frais supplémentaires de {lateFees}€ TTC peuvent s'appliquer.</p>
                <p className="text-sm text-orange-600 mt-2">
                  Les pénalités exactes seront calculées automatiquement lors du retour et un paiement sera requis si nécessaire.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Heure de retour automatique */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Heure de retour automatique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>L'heure de retour sera automatiquement enregistrée</strong> au moment où vous cliquerez sur le bouton "Rendre le véhicule".
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Cette mesure évite les fraudes et garantit une heure de retour précise.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sélection du type de retour */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Type de retour</CardTitle>
            </CardHeader>
            <CardContent>
              {reservation.carSittingOption ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      dropoffType === 'normal' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDropoffTypeChange('normal')}
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium">Retour normal</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rendre le véhicule à la destination initiale
                    </p>
                  </div>
                  
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      dropoffType === 'carsitter' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDropoffTypeChange('carsitter')}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Avec carsitter</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Faire récupérer le véhicule par un carsitter
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="p-4 border border-blue-500 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium">Retour normal</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Rendre le véhicule à la destination initiale
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mt-2">
                    <p className="text-sm text-gray-600">
                      <strong>Note :</strong> L'option car sitting n'était pas activée lors de votre réservation. 
                      Seul le retour normal est disponible.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire de dropoff normal */}
          {dropoffType === 'normal' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du retour</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={normalForm.handleSubmit(handleNormalDropoff)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentMileage">Kilométrage actuel</Label>
                    <Input
                      id="currentMileage"
                      type="number"
                      {...normalForm.register('currentMileage', { valueAsNumber: true })}
                    />
                    {normalForm.formState.errors.currentMileage && (
                      <p className="text-sm text-red-500">
                        {normalForm.formState.errors.currentMileage.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={normalForm.watch('hasAccident')}
                      onCheckedChange={(checked) => normalForm.setValue('hasAccident', checked as boolean)}
                    />
                    <Label htmlFor="hasAccident">J'ai eu un accident avec ce véhicule</Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      'Rendre le véhicule'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Formulaire de dropoff avec carsitter */}
          {dropoffType === 'carsitter' && reservation.carSittingOption && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du retour avec carsitter</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={carSitterForm.handleSubmit(handleCarSitterDropoff)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentMileage">Kilométrage actuel</Label>
                    <Input
                      id="currentMileage"
                      type="number"
                      {...carSitterForm.register('currentMileage', { valueAsNumber: true })}
                    />
                    {carSitterForm.formState.errors.currentMileage && (
                      <p className="text-sm text-red-500">
                        {carSitterForm.formState.errors.currentMileage.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={carSitterForm.watch('hasAccident')}
                      onCheckedChange={(checked) => carSitterForm.setValue('hasAccident', checked as boolean)}
                    />
                    <Label htmlFor="hasAccident">J'ai eu un accident avec ce véhicule</Label>
                  </div>

                  {/* Sélection du carsitter */}
                  <div>
                    <Label htmlFor="carSitterId">Choisir un carsitter</Label>
                    {loadingCarSitters ? (
                      <div className="flex items-center space-x-2 p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Chargement des carsitters...</span>
                      </div>
                    ) : (
                      <Select 
                        value={carSitterForm.watch('carSitterId')}
                        onValueChange={(value) => carSitterForm.setValue('carSitterId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un carsitter" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCarSitters.map((carSitter) => (
                            <SelectItem key={carSitter.id} value={carSitter.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {carSitter.user.firstName} {carSitter.user.lastName}
                                </span>
                                {carSitter.user.phoneNumber && (
                                  <span className="text-muted-foreground text-sm ml-2">
                                    {carSitter.user.phoneNumber}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {carSitterForm.formState.errors.carSitterId && (
                      <p className="text-sm text-red-500">
                        {carSitterForm.formState.errors.carSitterId.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading || loadingCarSitters}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      'Créer la demande de retour'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
      
      {/* Modal de paiement des pénalités */}
      {showPenaltyPayment && paymentClientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret: paymentClientSecret }}>
          <PaymentModal
            isOpen={showPenaltyPayment}
            onClose={() => setShowPenaltyPayment(false)}
            amount={penaltyAmount * 100} // Convertir en centimes
            invoiceId={penaltyInvoiceId || ''}
            onSuccess={handlePenaltyPaymentSuccess}
            onError={() => {
              setShowPenaltyPayment(false);
              toast.error('Erreur lors du paiement des pénalités');
            }}
          />
        </Elements>
      )}
    </Dialog>
  );
} 