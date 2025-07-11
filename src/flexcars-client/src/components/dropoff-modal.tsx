"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  MapPin, 
  Loader2, 
  Car, 
  AlertTriangle,
  CreditCard,
  Users
} from 'lucide-react';

import { Reservation } from '@/types/reservation';
import { vehicleApi, carSitterApi, paymentApi, invoiceApi } from '@/lib/api';
import { PaymentModal } from './payment-modal';
import { StripeProvider } from './stripe-provider';

// Helper function pour créer les schémas avec validation de date
const createDropoffSchema = (reservation: Reservation) => {
  const baseSchema = {
    currentMileage: z.number().min(0, "Le kilométrage doit être positif"),
    hasAccident: z.boolean(),
    dropoffTime: z.string()
      .refine((dateString) => {
        const dropoffDate = new Date(dateString);
        const startDate = new Date(reservation.startDatetime);
        return dropoffDate >= startDate;
      }, {
        message: `La date de rendu ne peut pas être antérieure au début de la réservation (${new Date(reservation.startDatetime).toLocaleDateString('fr-FR', { 
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        })})`
      }),
  };

  return {
    normal: z.object(baseSchema),
    carsitter: z.object({
      ...baseSchema,
      carSitterId: z.string().min(1, "Veuillez sélectionner un carsitter"),
      signature: z.string().optional(),
    })
  };
};

type DropoffNormalFormData = {
  currentMileage: number;
  hasAccident: boolean;
  dropoffTime: string;
};

type DropoffCarSitterFormData = {
  currentMileage: number;
  hasAccident: boolean;
  dropoffTime: string;
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

interface PenaltyResponse {
  needsPayment: boolean;
  penaltyAmount: number;
  penaltyInvoiceId?: string;
  message: string;
}

interface DropoffResponse {
  message: string;
  status: string;
}

export function DropoffModal({ reservation, isOpen, onClose, onSuccess }: DropoffModalProps) {
  const [dropoffType, setDropoffType] = useState<'normal' | 'carsitter'>('normal');
  const [availableCarSitters, setAvailableCarSitters] = useState<CarSitter[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCarSitters, setLoadingCarSitters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLateReturn, setIsLateReturn] = useState(false);
  const [lateFees, setLateFees] = useState(0);
  const [lateFeesPaymentRequired, setLateFeesPaymentRequired] = useState(false);
  const [lateFeesPaymentCompleted, setLateFeesPaymentCompleted] = useState(false);

  // États unifiés pour le paiement
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'late_fees' | 'penalty' | null>(null);
  const [penaltiesAlreadyPaid, setPenaltiesAlreadyPaid] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  // Créer les schémas de validation avec la réservation
  const schemas = useMemo(() => createDropoffSchema(reservation), [reservation]);

  // Fonction pour gérer le changement de type de dropoff avec validation
  const handleDropoffTypeChange = (newType: 'normal' | 'carsitter') => {
    if (newType === 'carsitter' && !reservation.carSittingOption) {
      toast.error('L\'option car sitting n\'était pas activée lors de votre réservation');
      return;
    }
    setDropoffType(newType);
  };

  // Formulaires
  const normalForm = useForm<DropoffNormalFormData>({
    resolver: zodResolver(schemas.normal),
    defaultValues: {
      currentMileage: reservation.vehicle?.currentMileage || 0,
      hasAccident: false,
      dropoffTime: new Date().toISOString().slice(0, 16),
    },
  });

  const carSitterForm = useForm<DropoffCarSitterFormData>({
    resolver: zodResolver(schemas.carsitter),
    defaultValues: {
      currentMileage: reservation.vehicle?.currentMileage || 0,
      hasAccident: false,
      dropoffTime: new Date().toISOString().slice(0, 16),
      carSitterId: '',
    },
  });

  // Surveiller les changements d'heure de dropoff pour calculer les frais en temps réel
  const normalDropoffTime = normalForm.watch('dropoffTime');
  const carSitterDropoffTime = carSitterForm.watch('dropoffTime');

  // Calculer les frais de retard
  const calculateLateFees = useCallback((dropoffTime: string) => {
    const dropoffDate = new Date(dropoffTime);
    const endDate = new Date(reservation.endDatetime);
    
    if (dropoffDate > endDate) {
      const hoursLate = Math.ceil((dropoffDate.getTime() - endDate.getTime()) / (1000 * 60 * 60));
      const hourlyRate = 25; // 25€ par heure de retard
      const fees = hoursLate * hourlyRate;
      
      setIsLateReturn(true);
      setLateFees(fees);
      setLateFeesPaymentRequired(true);
      
      // Reset payment completion if fees change
      if (fees !== lateFees) {
        setLateFeesPaymentCompleted(false);
      }
      
      return {
        isLate: true,
        hoursLate,
        fees,
        message: `Retard de ${hoursLate} heure(s). Frais supplémentaires : ${fees}€ TTC`
      };
    }
    
    setIsLateReturn(false);
    setLateFees(0);
    setLateFeesPaymentRequired(false);
    setLateFeesPaymentCompleted(false);
    return { isLate: false, hoursLate: 0, fees: 0, message: '' };
  }, [reservation.endDatetime, lateFees]);

  useEffect(() => {
    if (dropoffType === 'normal' && normalDropoffTime) {
      calculateLateFees(normalDropoffTime);
    }
  }, [normalDropoffTime, dropoffType, calculateLateFees]);

  useEffect(() => {
    if (dropoffType === 'carsitter' && carSitterDropoffTime) {
      calculateLateFees(carSitterDropoffTime);
    }
  }, [carSitterDropoffTime, dropoffType, calculateLateFees]);

  // Obtenir la position actuelle
  useEffect(() => {
    if (isOpen) {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          toast.error('Impossible d\'obtenir votre position');
        }
      );
    }
  }, [isOpen]);

  // Charger les carsitters disponibles quand l'utilisateur choisit cette option
  useEffect(() => {
    if (dropoffType === 'carsitter' && reservation.carSittingOption) {
      loadAvailableCarSitters();
    }
  }, [dropoffType, reservation.carSittingOption]);

  const loadAvailableCarSitters = async () => {
    try {
      setLoadingCarSitters(true);
      const response = await carSitterApi.getAllAvailable();
      setAvailableCarSitters((response.data as CarSitter[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des carsitters:', error);
      toast.error('Impossible de charger les carsitters disponibles');
    } finally {
      setLoadingCarSitters(false);
    }
  };

  // Vérifier les pénalités avant le dropoff
  const checkPenalties = async (hasAccident: boolean, dropoffTime: string) => {
    try {
      // Calculer les frais de retard
      const lateFeesInfo = calculateLateFees(dropoffTime);
      console.log('🔍 Calcul des frais de retard:', lateFeesInfo);
      console.log('💰 Frais de retard déjà payés:', lateFeesPaymentCompleted);
      
      const response = await vehicleApi.calculatePenalty({
        reservationId: reservation.id,
        hasAccident
      });

      const penaltyData = response.data as PenaltyResponse;
      console.log('📊 Pénalités du serveur:', penaltyData);
      
      // Ajouter les frais de retard aux pénalités existantes SEULEMENT s'ils n'ont pas été payés
      if (lateFeesInfo.isLate && !lateFeesPaymentCompleted) {
        console.log('➕ Ajout des frais de retard aux pénalités');
        penaltyData.needsPayment = true;
        penaltyData.penaltyAmount += lateFeesInfo.fees;
        penaltyData.message = penaltyData.message 
          ? `${penaltyData.message} + ${lateFeesInfo.message}`
          : lateFeesInfo.message;
      } else if (lateFeesInfo.isLate && lateFeesPaymentCompleted) {
        console.log('✅ Frais de retard déjà payés, pas d\'ajout aux pénalités');
      }
      
      console.log('📋 Pénalités finales:', penaltyData);
      return penaltyData;
    } catch (error) {
      console.error('Erreur lors du calcul des pénalités:', error);
      toast.error('Erreur lors de la vérification des pénalités');
      return null;
    }
  };

  // Gérer le paiement des pénalités
  const handlePenaltyPayment = async (penaltyData: PenaltyResponse) => {
    try {
      // 1. Créer une facture pour les pénalités
      console.log('💰 Création de la facture pour pénalités:', penaltyData.penaltyAmount);
      const invoiceResponse = await invoiceApi.createInvoice({
        amount: penaltyData.penaltyAmount,
        customerId: reservation.customerId,
        reservationId: reservation.id,
        dueDate: new Date().toISOString(), // Due immédiatement
      });
      
      const createdInvoice = invoiceResponse.data as { id: string };
      console.log('📄 Facture créée pour pénalités:', createdInvoice);
      
      // 2. Créer l'intention de paiement Stripe
      console.log('💳 Création de l\'intention de paiement Stripe pour pénalités...');
      const paymentResponse = await paymentApi.createPaymentIntent(createdInvoice.id);
      
      console.log('🔐 Intention de paiement créée pour pénalités:', paymentResponse.data);
      
      if (paymentResponse.data.error || !paymentResponse.data.clientSecret) {
        console.error('❌ Erreur PaymentIntent pénalités:', paymentResponse.data.error);
        toast.error(paymentResponse.data.error || 'Impossible de créer l\'intention de paiement');
        return;
      }
      
      // 3. Préparer le modal de paiement
      setPaymentClientSecret(paymentResponse.data.clientSecret);
      setPaymentInvoiceId(createdInvoice.id);
      setPaymentAmount(paymentResponse.data.amount);
      setPaymentType('penalty');
      setShowPaymentModal(true);
      
    } catch (error: unknown) {
      console.error('❌ Erreur lors du paiement des pénalités:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du paiement';
      toast.error(errorMessage);
    }
  };

  // Dropoff normal avec vérification des pénalités
  const handleNormalDropoff = async (data: DropoffNormalFormData) => {
    if (!currentLocation) {
      toast.error('Position non disponible');
      return;
    }

    try {
      setLoading(true);

      // Vérifier les pénalités et frais de retard SEULEMENT si elles n'ont pas déjà été payées
      if (!penaltiesAlreadyPaid) {
        console.log('🔍 Vérification des pénalités pour dropoff normal');
        const penaltyCheck = await checkPenalties(data.hasAccident, data.dropoffTime);
        if (!penaltyCheck) return;

        console.log('📊 Résultat final des pénalités:', penaltyCheck);
        
        // Vérifier si un paiement est vraiment nécessaire
        if (penaltyCheck.needsPayment && penaltyCheck.penaltyAmount > 0) {
          console.log('💰 Paiement requis pour pénalités:', penaltyCheck.penaltyAmount);
          // Créer l'intention de paiement pour les pénalités
          await handlePenaltyPayment(penaltyCheck);
          return;
        }
      } else {
        console.log('✅ Pénalités déjà payées, procédure directe de dropoff');
      }

      // Effectuer le dropoff
      await performFinalDropoff(data);
    } catch (error: unknown) {
      console.error('Erreur lors du dropoff:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du retour du véhicule';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Dropoff normal final (sans vérification des pénalités)
  const handleFinalNormalDropoff = async (data: DropoffNormalFormData) => {
    if (!currentLocation) {
      toast.error('Position non disponible');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Dropoff final normal après paiement des pénalités');
      await performFinalDropoff(data);
    } catch (error: unknown) {
      console.error('Erreur lors du dropoff final:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du retour du véhicule';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction partagée pour effectuer le dropoff final
  const performFinalDropoff = async (data: DropoffNormalFormData) => {
    const response = await vehicleApi.dropoffNormal({
      reservationId: reservation.id,
      currentMileage: data.currentMileage,
      dropoffTime: data.dropoffTime,
      hasAccident: data.hasAccident,
      currentLocationLat: currentLocation!.lat,
      currentLocationLng: currentLocation!.lng
    });

    const dropoffData = response.data as DropoffResponse;
    toast.success(dropoffData.message || 'Véhicule rendu avec succès');
    onSuccess();
    onClose();
  };

  // Dropoff avec carsitter avec vérification des pénalités
  const handleCarSitterDropoff = async (data: DropoffCarSitterFormData) => {
    console.log('🚀 Début handleCarSitterDropoff avec data:', data);
    
    try {
      setLoading(true);

      // Vérifier les pénalités et frais de retard SEULEMENT si elles n'ont pas déjà été payées
      if (!penaltiesAlreadyPaid) {
        console.log('🔍 Vérification des pénalités et frais de retard...');
        const penaltyCheck = await checkPenalties(data.hasAccident, data.dropoffTime);
        if (!penaltyCheck) {
          console.log('❌ Échec de la vérification des pénalités');
          return;
        }

        console.log('📊 Résultat final des pénalités:', penaltyCheck);
        
        // Vérifier si un paiement est vraiment nécessaire
        if (penaltyCheck.needsPayment && penaltyCheck.penaltyAmount > 0) {
          console.log('💰 Paiement requis pour pénalités:', penaltyCheck.penaltyAmount);
          // Créer l'intention de paiement pour les pénalités
          await handlePenaltyPayment(penaltyCheck);
          return;
        }
      } else {
        console.log('✅ Pénalités déjà payées, procédure directe de dropoff avec carsitter');
      }

      // Effectuer le dropoff avec carsitter
      await performFinalCarSitterDropoff(data);
    } catch (error: unknown) {
      console.error('❌ Erreur lors du dropoff avec carsitter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la demande';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Dropoff avec carsitter final (sans vérification des pénalités)
  const handleFinalCarSitterDropoff = async (data: DropoffCarSitterFormData) => {
    try {
      setLoading(true);
      console.log('🚀 Dropoff final avec carsitter après paiement des pénalités');
      await performFinalCarSitterDropoff(data);
    } catch (error: unknown) {
      console.error('❌ Erreur lors du dropoff final avec carsitter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la demande';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction partagée pour effectuer le dropoff final avec carsitter
  const performFinalCarSitterDropoff = async (data: DropoffCarSitterFormData) => {
    // Utiliser des coordonnées par défaut si la géolocalisation n'est pas disponible
    const locationLat = currentLocation?.lat || 48.8566; // Paris par défaut
    const locationLng = currentLocation?.lng || 2.3522;

    console.log('🚗 Création de la demande de dropoff avec carsitter...');
    // Créer la demande de dropoff avec carsitter
    const response = await vehicleApi.dropoffWithCarSitter({
      reservationId: reservation.id,
      currentMileage: data.currentMileage,
      dropoffTime: data.dropoffTime,
      hasAccident: data.hasAccident,
      carSitterId: data.carSitterId,
      currentLocationLat: locationLat,
      currentLocationLng: locationLng,
      signature: data.signature
    });

    console.log('✅ Réponse reçue:', response);
    const dropoffData = response.data as DropoffResponse;
    toast.success(dropoffData.message || 'Demande de dropoff créée avec succès');
    onSuccess();
    onClose();
  };

  // Gérer le paiement des frais de retard
  const handleLateFeesPayment = async () => {
    try {
      setLoading(true);
      
      // 1. Créer une facture pour les frais de retard
      console.log('💰 Création de la facture pour frais de retard:', lateFees);
      const invoiceResponse = await invoiceApi.createInvoice({
        amount: lateFees,
        customerId: reservation.customerId,
        reservationId: reservation.id,
        dueDate: new Date().toISOString(), // Due immédiatement
      });
      
      const createdInvoice = invoiceResponse.data as { id: string };
      console.log('📄 Facture créée:', createdInvoice);
      
      // 2. Créer l'intention de paiement Stripe
      console.log('💳 Création de l\'intention de paiement Stripe...');
      const paymentResponse = await paymentApi.createPaymentIntent(createdInvoice.id);
      
      console.log('🔐 Intention de paiement créée:', paymentResponse.data);
      
      if (paymentResponse.data.error || !paymentResponse.data.clientSecret) {
        console.error('❌ Erreur PaymentIntent:', paymentResponse.data.error);
        toast.error(paymentResponse.data.error || 'Impossible de créer l\'intention de paiement');
        return;
      }
      
      // 3. Ouvrir le modal de paiement
      setPaymentClientSecret(paymentResponse.data.clientSecret);
      setPaymentInvoiceId(createdInvoice.id);
      setPaymentAmount(paymentResponse.data.amount);
      setPaymentType('late_fees');
      setShowPaymentModal(true);
      
    } catch (error: unknown) {
      console.error('❌ Erreur lors du paiement des frais de retard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du paiement';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires unifiés pour le paiement
  const handlePaymentSuccess = () => {
    if (paymentType === 'late_fees') {
      handleLateFeesPaymentSuccess();
    } else if (paymentType === 'penalty') {
      handlePenaltyPaymentSuccess();
    }
  };

  const handlePaymentClose = () => {
    if (paymentType === 'late_fees') {
      handleLateFeesPaymentClose();
    } else if (paymentType === 'penalty') {
      handlePenaltyPaymentClose();
    }
  };

  // Succès du paiement des frais de retard
  const handleLateFeesPaymentSuccess = () => {
    if (paymentInProgress) {
      console.log('⚠️ Paiement déjà en cours de traitement, ignoré');
      return;
    }
    
    console.log('✅ Paiement des frais de retard réussi !');
    setPaymentInProgress(true);
    setLateFeesPaymentCompleted(true);
    setShowPaymentModal(false);
    setPaymentClientSecret(null);
    setPaymentInvoiceId(null);
    setPaymentAmount(0);
    setPaymentType(null);
    toast.success('Paiement des frais de retard effectué avec succès');
    
    // Réinitialiser après un délai
    setTimeout(() => setPaymentInProgress(false), 3000);
  };

  // Fermeture du modal de paiement des frais de retard
  const handleLateFeesPaymentClose = () => {
    setShowPaymentModal(false);
    setPaymentClientSecret(null);
    setPaymentInvoiceId(null);
    setPaymentAmount(0);
    setPaymentType(null);
  };

  // Succès du paiement des pénalités
  const handlePenaltyPaymentSuccess = () => {
    if (paymentInProgress) {
      console.log('⚠️ Paiement déjà en cours de traitement, ignoré');
      return;
    }
    
    console.log('✅ Paiement des pénalités réussi !');
    setPaymentInProgress(true);
    setShowPaymentModal(false);
    setPaymentClientSecret(null);
    setPaymentInvoiceId(null);
    setPaymentAmount(0);
    setPaymentType(null);
    setPenaltiesAlreadyPaid(true);
    toast.success('Paiement des pénalités effectué avec succès');
    
    // Procéder directement au dropoff SANS vérifier les pénalités à nouveau
    if (dropoffType === 'normal') {
      handleFinalNormalDropoff(normalForm.getValues());
    } else {
      handleFinalCarSitterDropoff(carSitterForm.getValues());
    }
    
    // Réinitialiser après completion
    setTimeout(() => setPaymentInProgress(false), 5000);
  };

  // Fermeture du modal de paiement des pénalités
  const handlePenaltyPaymentClose = () => {
    setShowPaymentModal(false);
    setPaymentClientSecret(null);
    setPaymentInvoiceId(null);
    setPaymentAmount(0);
    setPaymentType(null);
  };

  const resetModal = () => {
    setDropoffType('normal');
    setAvailableCarSitters([]);
    setCurrentLocation(null);
    setLoading(false);
    setLoadingCarSitters(false);
    setShowPaymentModal(false);
    setIsLateReturn(false);
    setLateFees(0);
    setLateFeesPaymentRequired(false);
    setLateFeesPaymentCompleted(false);
    setPaymentClientSecret(null);
    setPaymentInvoiceId(null);
    setPaymentAmount(0);
    setPaymentType(null);
    setPenaltiesAlreadyPaid(false);
    setPaymentInProgress(false);
    
    // Reset forms
    normalForm.reset();
    carSitterForm.reset();
  };

  // Réinitialiser les états de paiement quand on change de type
  useEffect(() => {
    setLateFeesPaymentRequired(false);
    setLateFeesPaymentCompleted(false);
  }, [dropoffType]);

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Véhicule</Label>
                    <p className="font-medium">
                      {reservation.vehicle?.brand} {reservation.vehicle?.model}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Plaque</Label>
                    <p className="font-medium">{reservation.vehicle?.plateNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Début de location</Label>
                    <p className="font-medium">
                      {reservation.startDatetime ? new Date(reservation.startDatetime).toLocaleString('fr-FR') : 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fin prévue</Label>
                    <p className="font-medium">
                      {reservation.endDatetime ? new Date(reservation.endDatetime).toLocaleString('fr-FR') : 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Option Car Sitting</Label>
                    <Badge variant={reservation.carSittingOption ? 'default' : 'secondary'}>
                      {reservation.carSittingOption ? 'Activée' : 'Non activée'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerte pour retard si applicable */}
            {isLateReturn && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Retour en retard</AlertTitle>
                <AlertDescription className="text-orange-700">
                  <div className="space-y-3">
                    <p>
                      Votre retour est effectué après la date prévue. Des frais supplémentaires de <strong>{lateFees}€ TTC</strong> s'appliquent.
                    </p>
                    
                    {lateFeesPaymentRequired && !lateFeesPaymentCompleted && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          💳 Paiement requis avant de pouvoir rendre le véhicule
                        </p>
                        <Button
                          onClick={handleLateFeesPayment}
                          disabled={loading}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Payer les frais de retard ({lateFees}€)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {lateFeesPaymentCompleted && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Paiement effectué avec succès</span>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Choix du type de dropoff */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Type de retour</CardTitle>
              </CardHeader>
              <CardContent>
                {reservation.carSittingOption ? (
                  // Si la réservation avait l'option car sitting, proposer les deux choix
                  <div className="grid grid-cols-2 gap-4">
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
                  // Si la réservation n'avait pas l'option car sitting, seul le retour normal est possible
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Retour normal</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Rendre le véhicule à la destination initiale
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
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
                    <div className="grid grid-cols-2 gap-4">
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
                      
                      <div>
                        <Label htmlFor="dropoffTime">Heure de retour</Label>
                        <Input
                          id="dropoffTime"
                          type="datetime-local"
                          {...normalForm.register('dropoffTime')}
                        />
                        {normalForm.formState.errors.dropoffTime && (
                          <p className="text-sm text-red-500">
                            {normalForm.formState.errors.dropoffTime.message}
                          </p>
                        )}
                      </div>
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
                      disabled={loading || (lateFeesPaymentRequired && !lateFeesPaymentCompleted)}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (lateFeesPaymentRequired && !lateFeesPaymentCompleted) ? (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Paiement requis avant de continuer
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
                    <div className="grid grid-cols-2 gap-4">
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
                      
                      <div>
                        <Label htmlFor="dropoffTime">Heure de retour</Label>
                        <Input
                          id="dropoffTime"
                          type="datetime-local"
                          {...carSitterForm.register('dropoffTime')}
                        />
                        {carSitterForm.formState.errors.dropoffTime && (
                          <p className="text-sm text-red-500">
                            {carSitterForm.formState.errors.dropoffTime.message}
                          </p>
                        )}
                      </div>
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
                      disabled={loading || loadingCarSitters || (lateFeesPaymentRequired && !lateFeesPaymentCompleted)}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (lateFeesPaymentRequired && !lateFeesPaymentCompleted) ? (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Paiement requis avant de continuer
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
      </Dialog>

      {/* Modal de paiement unifié */}
      {showPaymentModal && !paymentInProgress && (paymentClientSecret || paymentType === 'late_fees' || paymentType === 'penalty') && (
        <StripeProvider clientSecret={paymentClientSecret || ''}>
          <PaymentModal
            isOpen={showPaymentModal && !paymentInProgress}
            onClose={handlePaymentClose}
            amount={paymentAmount}
            invoiceId={paymentInvoiceId || ''}
            onSuccess={handlePaymentSuccess}
            paymentType={paymentType}
          />
        </StripeProvider>
      )}
    </>
  );
} 