"use client";

import { useState, useRef, useEffect } from 'react';
import { format, addHours, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon,
  Clock,
  MapPin,
  Shield,
  CheckCircle,
  AlertTriangle,
  Euro,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Car,
  User,
  X,
  CreditCard
} from 'lucide-react';

import { Vehicle, Location, CreateReservationRequest, User as UserType, AvailabilityCheckResponse } from '@/types';
import { ReservationStatus } from '@/types/reservation';
import { reservationApi, paymentApi } from '@/lib/api';
import { cn, calculateTTCPrice } from '@/lib/utils';
import { StripeProvider } from './stripe-provider';
import { PaymentModal } from './payment-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema de validation pour les données du formulaire
const bookingSchema = z.object({
  startDatetime: z.date().min(new Date(), "La date de début doit être dans le futur"),
  endDatetime: z.date(),
  pickupLocation: z.nativeEnum(Location),
  dropoffLocation: z.nativeEnum(Location),
  carSittingOption: z.boolean().default(false),
}).refine((data) => {
  return data.endDatetime > data.startDatetime;
}, {
  message: "La date de fin doit être après la date de début",
  path: ["endDatetime"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingWizardProps {
  vehicle: Vehicle;
  user: UserType;
  onComplete: (reservation: CreateReservationRequest) => void;
  onCancel: () => void;
}

interface ReservationResponse {
  data: {
    id: string;
    invoices?: Array<{ id: string; invoiceType?: string }>;
  };
}

enum BookingStep {
  DATES = 'dates',
  AVAILABILITY = 'availability',
  LOCATIONS = 'locations',
  OPTIONS = 'options',
  CONFIRMATION = 'confirmation',
}

const STEPS = [
  { id: BookingStep.DATES, title: 'Dates & Horaires', icon: CalendarIcon },
  { id: BookingStep.AVAILABILITY, title: 'Disponibilité', icon: CheckCircle },
  { id: BookingStep.LOCATIONS, title: 'Lieux', icon: MapPin },
  { id: BookingStep.OPTIONS, title: 'Options', icon: Car },
  { id: BookingStep.CONFIRMATION, title: 'Confirmation', icon: Shield },
];

export function BookingWizard({ vehicle, user, onComplete, onCancel }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.DATES);
  const [availabilityCheck, setAvailabilityCheck] = useState<AvailabilityCheckResponse | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour le paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<CreateReservationRequest | null>(null);
  const [reservationCreated, setReservationCreated] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null);
  
  // Protection synchrone contre les clics multiples
  const processingRef = useRef(false);
  
  // Cache des requêtes en cours pour éviter les appels multiples
  const activeRequestRef = useRef<Promise<ReservationResponse> | null>(null);
  const requestHashRef = useRef<string | null>(null);

  // Timeout automatique pour les réservations non payées
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage des timeouts pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      startDatetime: addHours(new Date(), 1),
      endDatetime: addHours(new Date(), 3),
      pickupLocation: Location.SAINT_DENIS,
      dropoffLocation: Location.ISSY_LES_MOULINEAUX,
      carSittingOption: false,
    },
  });

  const watchedValues = form.watch();

  // Calculer le prix estimé TTC
  const calculatePrice = () => {
    if (!watchedValues.startDatetime || !watchedValues.endDatetime) return 0;
    
    const hours = differenceInHours(watchedValues.endDatetime, watchedValues.startDatetime);
    const basePriceHT = 25; // Prix de base HT par heure
    let totalHT = hours * basePriceHT;
    
    // Majoration pour car sitting (HT)
    if (watchedValues.carSittingOption) {
      totalHT += 50; // Frais supplémentaires HT pour car sitting
    }
    
    // Retourner le prix TTC
    return calculateTTCPrice(totalHT);
  };

  // Vérifier la disponibilité
  const checkAvailability = async () => {
    if (!watchedValues.startDatetime || !watchedValues.endDatetime) return;
    
    setIsCheckingAvailability(true);
    try {
      const response = await reservationApi.checkAvailability({
        vehicleId: vehicle.id,
        startDatetime: watchedValues.startDatetime,
        endDatetime: watchedValues.endDatetime,
      });
      setAvailabilityCheck(response);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      setAvailabilityCheck({
        isAvailable: false,
        message: 'Impossible de vérifier la disponibilité pour le moment. Veuillez réessayer.',
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  // Gérer l'étape suivante avec validation
  const handleNextStep = async () => {
    if (currentStep === BookingStep.DATES) {
      // Valider les dates
      const datesValid = await form.trigger(['startDatetime', 'endDatetime']);
      if (!datesValid) return;
      
      // Vérifier la disponibilité
      await checkAvailability();
      nextStep();
    } else if (currentStep === BookingStep.AVAILABILITY) {
      if (!availabilityCheck?.isAvailable) {
        toast.error('Véhicule non disponible pour ces dates');
        return;
      }
      nextStep();
    } else if (currentStep === BookingStep.LOCATIONS) {
      const locationsValid = await form.trigger(['pickupLocation', 'dropoffLocation']);
      if (!locationsValid) return;
      nextStep();
    } else if (currentStep === BookingStep.OPTIONS) {
      nextStep();
    } else if (currentStep === BookingStep.CONFIRMATION) {
      // Déclencher directement le paiement immédiat
      await handlePayNow();
    }
  };

  // Gérer le choix de paiement immédiat
  const handlePayNow = async () => {
    console.log('🚀 handlePayNow - processingRef.current:', processingRef.current);
    
    // Protection synchrone immédiate
    if (processingRef.current) {
      console.log('⚠️ handlePayNow - Traitement déjà en cours, abandon');
      return;
    }
    
    if (isSubmitting || reservationCreated) {
      console.log('⚠️ handlePayNow - États bloquants, abandon');
      return;
    }
    
    processingRef.current = true;
    await createReservation();
  };



  // Créer la réservation
  const createReservation = async () => {
    console.log('🏁 createReservation appelé pour paiement immédiat');
    console.log('🛡️ reservationCreated:', reservationCreated);
    console.log('🛡️ processingRef.current:', processingRef.current);
    
    if (reservationCreated) {
      console.log('⚠️ Réservation déjà créée, abandon');
      processingRef.current = false;
      return; // Protection supplémentaire
    }
    
    setIsSubmitting(true);
    try {
      const formData = form.getValues();
      const reservationData: CreateReservationRequest = {
        vehicleId: vehicle.id,
        customerId: user.id,
        startDatetime: formData.startDatetime,
        endDatetime: formData.endDatetime,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        carSittingOption: formData.carSittingOption,
      };
      
      console.log('📝 Données de réservation:', reservationData);
      
      // Créer un hash unique pour cette requête
      const requestHash = JSON.stringify({
        vehicleId: vehicle.id,
        customerId: user.id,
        startDatetime: formData.startDatetime.getTime(),
        endDatetime: formData.endDatetime.getTime(),
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        carSittingOption: formData.carSittingOption,
      });
      
      console.log('🔑 Hash de requête:', requestHash);
      
      // Vérifier si une requête identique est déjà en cours
      if (activeRequestRef.current && requestHashRef.current === requestHash) {
        console.log('⚠️ Requête identique en cours, réutilisation...');
        const response = await activeRequestRef.current;
        console.log('✅ Réservation réutilisée:', (response as ReservationResponse).data);
        
        setCreatedReservation(reservationData);
        setReservationCreated(true);
        setCreatedReservationId((response as ReservationResponse).data.id); // Stocker l'ID de la réservation
        
        console.log('💳 Paiement immédiat');
        await handleImmediatePayment((response as ReservationResponse).data);
        return;
      }
      
      // Créer la nouvelle requête et la mettre en cache
      const reservationPromise = reservationApi.createReservation(reservationData);
      activeRequestRef.current = reservationPromise;
      requestHashRef.current = requestHash;
      
      console.log('🌐 Nouvel appel API de création de réservation');
      const response = await reservationPromise;
      console.log('✅ Réservation créée:', response.data);
      
      setCreatedReservation(reservationData);
      setReservationCreated(true);
      setCreatedReservationId(response.data.id); // Stocker l'ID de la réservation
      
      // Démarrer un timeout de sécurité de 10 minutes pour supprimer la réservation si pas de paiement
      timeoutRef.current = setTimeout(async () => {
        if (createdReservationId && !showPaymentModal) {
          console.log('⏰ Timeout atteint - suppression automatique de la réservation non payée');
          try {
            await reservationApi.updateReservation(response.data.id, {
              status: ReservationStatus.CANCELLED
            });
            console.log('✅ Réservation supprimée automatiquement après timeout');
            
            // Réinitialiser les états
            setCreatedReservation(null);
            setReservationCreated(false);
            setCreatedReservationId(null);
            
            toast.warning('Délai de paiement dépassé - La réservation a été automatiquement annulée.');
          } catch (error) {
            console.error('❌ Erreur lors de la suppression automatique:', error);
          }
        }
      }, 10 * 60 * 1000); // 10 minutes
      
      console.log('💳 Paiement immédiat');
      // Préparer le paiement immédiat
      await handleImmediatePayment(response.data);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la réservation:', error);
      toast.error('Erreur lors de la création de la réservation');
      // Réinitialiser les protections en cas d'erreur
      setReservationCreated(false);
      processingRef.current = false;
      activeRequestRef.current = null;
      requestHashRef.current = null;
      
      // Nettoyer le timeout en cas d'erreur
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } finally {
      setIsSubmitting(false);
      // Note: On ne remet pas processingRef.current = false ici car pour "Payer maintenant",
      // le processus continue avec le modal de paiement
    }
  };

  // Gérer le paiement immédiat
  const handleImmediatePayment = async (reservation: { invoices?: Array<{ id: string; invoiceType?: string }> }) => {
    console.log('🎯 handleImmediatePayment appelé avec:', reservation);
    
    // Trouver la facture principale (première facture ou celle sans type spécifique)
    const mainInvoice = reservation.invoices?.find(inv => 
      !inv.invoiceType || inv.invoiceType === 'MAIN' || inv.invoiceType === 'BOOKING'
    ) || reservation.invoices?.[0];
    
    if (!mainInvoice?.id) {
      console.error('❌ Aucune facture trouvée:', reservation);
      toast.error('Aucune facture trouvée pour cette réservation');
      return;
    }

    setIsCreatingPayment(true);
    try {
      console.log('💳 Création du PaymentIntent pour la facture:', mainInvoice.id);
      const response = await paymentApi.createPaymentIntent(mainInvoice.id);
      console.log('📝 Réponse PaymentIntent:', response.data);
      
      if (response.data.error || !response.data.clientSecret) {
        console.error('❌ Erreur PaymentIntent:', response.data.error);
        toast.error(response.data.error || 'Impossible de créer l\'intention de paiement');
        return;
      }
      
      console.log('✅ PaymentIntent créé, ouverture du modal...');
      setPaymentClientSecret(response.data.clientSecret);
      setPaymentAmount(response.data.amount);
      setPaymentInvoiceId(mainInvoice.id);
      setShowPaymentModal(true);
    } catch (error: unknown) {
      console.error('❌ Erreur lors de la création de l\'intention de paiement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la préparation du paiement';
      toast.error(errorMessage);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  // Gérer les erreurs de paiement
  const handlePaymentError = async () => {
    console.log('❌ Erreur de paiement détectée');
    
    // IMPORTANT : Supprimer immédiatement la réservation en cas d'erreur de paiement
    if (createdReservation && createdReservationId) {
      try {
        console.log('🗑️ Suppression immédiate de la réservation suite à l\'erreur de paiement:', createdReservationId);
        
        // Annuler la réservation
        await reservationApi.updateReservation(createdReservationId, {
          status: ReservationStatus.CANCELLED
        });
        
        console.log('✅ Réservation annulée automatiquement suite à l\'erreur de paiement');
        
        // Réinitialiser les états
        setCreatedReservation(null);
        setReservationCreated(false);
        setCreatedReservationId(null);
        
        // Nettoyer le timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Réinitialiser les protections
        processingRef.current = false;
        activeRequestRef.current = null;
        requestHashRef.current = null;
        
        toast.error('Paiement échoué - La réservation temporaire a été supprimée automatiquement.');
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'annulation automatique de la réservation:', error);
        
        // Même en cas d'erreur, réinitialiser les états locaux
        setCreatedReservation(null);
        setReservationCreated(false);
        setCreatedReservationId(null);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        processingRef.current = false;
        activeRequestRef.current = null;
        requestHashRef.current = null;
        
        toast.error('Paiement échoué. Veuillez vérifier vos réservations et contacter le support si nécessaire.');
      }
    }
  };

  // Gérer le succès du paiement
  const handlePaymentSuccess = () => {
    console.log('✅ Paiement réussi !');
    toast.success('Paiement effectué avec succès ! Votre réservation est confirmée.');
    setShowPaymentModal(false);
    setPaymentClientSecret(null);
    setPaymentAmount(0);
    setPaymentInvoiceId(null);
    setIsCreatingPayment(false);
    
    // Réinitialiser toutes les protections
    processingRef.current = false;
    activeRequestRef.current = null;
    requestHashRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (createdReservation) {
      onComplete(createdReservation);
    }
  };

  // Gérer la fermeture du modal de paiement
  const handlePaymentModalClose = async () => {
    console.log('🔒 Fermeture du modal de paiement');
    setShowPaymentModal(false);
    setPaymentClientSecret(null);
    setPaymentAmount(0);
    setPaymentInvoiceId(null);
    setIsCreatingPayment(false);
    
    // Réinitialiser toutes les protections
    processingRef.current = false;
    activeRequestRef.current = null;
    requestHashRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Seulement supprimer la réservation si elle existe encore 
    // (pas déjà traitée par handlePaymentSuccess ou handlePaymentError)
    if (createdReservation && createdReservationId) {
      try {
        console.log('🗑️ Suppression de la réservation suite à la fermeture manuelle du modal:', createdReservationId);
        
        // Annuler la réservation
        await reservationApi.updateReservation(createdReservationId, {
          status: ReservationStatus.CANCELLED
        });
        
        console.log('✅ Réservation annulée automatiquement suite à la fermeture manuelle');
        
        // Réinitialiser les états
        setCreatedReservation(null);
        setReservationCreated(false);
        setCreatedReservationId(null);
        
        toast.info('Paiement annulé - La réservation temporaire a été supprimée automatiquement.');
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'annulation automatique de la réservation:', error);
        
        // Même en cas d'erreur, réinitialiser les états locaux
        setCreatedReservation(null);
        setReservationCreated(false);
        setCreatedReservationId(null);
        
        toast.error('Paiement annulé. Veuillez vérifier vos réservations et contacter le support si nécessaire.');
      }
      
      // Retourner à l'écran principal
      onCancel();
    } else {
      // Si pas de réservation créée ou déjà traitée, juste revenir en arrière
      toast.warning('Modal de paiement fermé.');
    }
  };

  // Helpers
  const getLocationLabel = (location: Location) => {
    switch (location) {
      case Location.PARIS_11:
        return 'Paris 11e';
      case Location.PARIS_19:
        return 'Paris 19e';
      case Location.ISSY_LES_MOULINEAUX:
        return 'Issy-les-Moulineaux';
      case Location.BOULOGNE:
        return 'Boulogne';
      case Location.SAINT_DENIS:
        return 'Saint-Denis';
      default:
        return location;
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, 'EEEE d MMMM yyyy à HH:mm', { locale: fr });
  };

  // Transformer les messages techniques en messages user-friendly
  const formatAvailabilityMessage = (message: string, isAvailable: boolean) => {
    if (isAvailable) {
      return 'Véhicule disponible pour ces dates !';
    }

    // Transformer les messages techniques en messages compréhensibles
    if (message.includes('conflit')) {
      return `Ce véhicule est déjà réservé pour une partie de cette période. Veuillez choisir d'autres dates.`;
    }
    
    if (message.includes('maintenance')) {
      return `Ce véhicule est en maintenance durant cette période. Veuillez choisir d'autres dates.`;
    }
    
    if (message.includes('non disponible')) {
      return `Ce véhicule n'est pas disponible pour ces dates. Veuillez choisir d'autres dates.`;
    }
    
    // Message par défaut plus friendly
    return `Ce véhicule n'est pas disponible pour ces dates. Veuillez choisir d'autres dates ou essayer un autre véhicule.`;
  };

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* En-tête avec véhicule */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {vehicle.imageUrl ? (
                  <Image 
                    src={vehicle.imageUrl} 
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Car className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h2>
                <p className="text-gray-600">{vehicle.year} • {vehicle.plateNumber}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Indicateur de progression */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Réservation en cours</h3>
            <span className="text-sm text-gray-500">
              Étape {currentStepIndex + 1} sur {STEPS.length}
            </span>
          </div>
          
          <Progress 
            value={progress} 
            className="mb-4 bg-blue-100 [&>div]:bg-blue-600" 
          />
          
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center space-y-2 text-xs",
                    isActive && "text-blue-600",
                    isCompleted && "text-green-600"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2",
                    isActive && "border-blue-600 bg-blue-50",
                    isCompleted && "border-green-600 bg-green-50",
                    !isActive && !isCompleted && "border-gray-300"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-center max-w-[80px] leading-tight">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contenu de l'étape */}
      <Card>
        <CardContent className="p-6">
          {currentStep === BookingStep.DATES && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CalendarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Choisir les dates</h3>
                <p className="text-gray-600">Sélectionnez vos dates et horaires de location</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDatetime">Date et heure de début</Label>
                  <Input
                    id="startDatetime"
                    type="datetime-local"
                    value={watchedValues.startDatetime ? format(watchedValues.startDatetime, "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => form.setValue('startDatetime', new Date(e.target.value))}
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    className="mt-1"
                  />
                  {form.formState.errors.startDatetime && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.startDatetime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDatetime">Date et heure de fin</Label>
                  <Input
                    id="endDatetime"
                    type="datetime-local"
                    value={watchedValues.endDatetime ? format(watchedValues.endDatetime, "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => form.setValue('endDatetime', new Date(e.target.value))}
                    min={watchedValues.startDatetime ? format(watchedValues.startDatetime, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    className="mt-1"
                  />
                  {form.formState.errors.endDatetime && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.endDatetime.message}
                    </p>
                  )}
                </div>
              </div>

              {watchedValues.startDatetime && watchedValues.endDatetime && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Durée de location</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {differenceInHours(watchedValues.endDatetime, watchedValues.startDatetime)} heures
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Du {formatDateTime(watchedValues.startDatetime)}
                  </p>
                  <p className="text-sm text-gray-700">
                    Au {formatDateTime(watchedValues.endDatetime)}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === BookingStep.AVAILABILITY && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Vérification de disponibilité</h3>
                <p className="text-gray-600">Vérification en cours...</p>
              </div>

              {isCheckingAvailability && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Vérification de la disponibilité...</p>
                </div>
              )}

              {availabilityCheck && (
                <div className={cn(
                  "w-full p-4 rounded-lg border flex items-start space-x-3",
                  availabilityCheck.isAvailable 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                )}>
                  {availabilityCheck.isAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className={cn(
                    "flex-1 text-sm",
                    availabilityCheck.isAvailable ? 'text-green-800' : 'text-red-800'
                  )}>
                    {formatAvailabilityMessage(availabilityCheck.message || '', availabilityCheck.isAvailable)}
                  </div>
                </div>
              )}

              {availabilityCheck && !availabilityCheck.isAvailable && (
                <div className="bg-blue-50 p-4 rounded-lg w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Suggestions</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Essayez des dates différentes</li>
                    <li>• Réduisez la durée de location</li>
                    <li>{`• Consultez d'autres véhicules disponibles`}</li>
                  </ul>
                </div>
              )}

              {availabilityCheck?.isAvailable && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Euro className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Prix estimé</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {calculatePrice().toFixed(2)} € TTC
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Pour {differenceInHours(watchedValues.endDatetime, watchedValues.startDatetime)} heures de location
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === BookingStep.LOCATIONS && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Choisir les lieux</h3>
                <p className="text-gray-600">Sélectionnez les lieux de récupération et de retour</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupLocation">Lieu de récupération</Label>
                  <Select 
                    value={watchedValues.pickupLocation} 
                    onValueChange={(value) => form.setValue('pickupLocation', value as Location)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez un lieu" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Location).map((location) => (
                        <SelectItem key={location} value={location}>
                          {getLocationLabel(location)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dropoffLocation">Lieu de retour</Label>
                  <Select 
                    value={watchedValues.dropoffLocation} 
                    onValueChange={(value) => form.setValue('dropoffLocation', value as Location)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez un lieu" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Location).map((location) => (
                        <SelectItem key={location} value={location}>
                          {getLocationLabel(location)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {watchedValues.pickupLocation && watchedValues.dropoffLocation && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Trajet</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Récupération:</span> {getLocationLabel(watchedValues.pickupLocation)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Retour:</span> {getLocationLabel(watchedValues.dropoffLocation)}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === BookingStep.OPTIONS && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Car className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Options supplémentaires</h3>
                <p className="text-gray-600">Personnalisez votre réservation</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Option Car Sitting</div>
                    <div className="text-sm text-gray-600">
                      Un car sitter peut livrer et récupérer le véhicule (+{(50 * 1.2).toFixed(2)}€ TTC)
                    </div>
                  </div>
                  <Checkbox
                    checked={watchedValues.carSittingOption}
                    onCheckedChange={(checked) => form.setValue('carSittingOption', checked)}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Euro className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Prix total :</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {calculatePrice().toFixed(2)} € TTC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Étape confirmation */}
          {currentStep === BookingStep.CONFIRMATION && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Confirmation de réservation</h3>
                <p className="text-gray-600">
                  Vérifiez les détails de votre réservation avant de procéder au paiement
                </p>
              </div>

              {/* Alerte importante sur le processus de paiement */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Information importante</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <div className="space-y-2">
                    <p>
                      Votre réservation sera <strong>temporaire</strong> jusqu'à la confirmation du paiement.
                    </p>
                    <p>
                      En cas d'annulation du paiement, la réservation sera automatiquement supprimée.
                    </p>
                    <p className="text-sm">
                      Le véhicule sera bloqué pour vous pendant le processus de paiement.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Résumé de la réservation */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      Véhicule sélectionné
                    </h4>
                    <div className="space-y-2">
                      <p className="font-medium text-lg">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        {vehicle.year} • {vehicle.plateNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Carburant: {vehicle.fuelType}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Période de location
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Début</p>
                        <p className="font-medium">
                          {watchedValues.startDatetime
                            ? format(watchedValues.startDatetime, 'dd MMMM yyyy à HH:mm', { locale: fr })
                            : 'Non défini'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fin</p>
                        <p className="font-medium">
                          {watchedValues.endDatetime
                            ? format(watchedValues.endDatetime, 'dd MMMM yyyy à HH:mm', { locale: fr })
                            : 'Non défini'}
                        </p>
                      </div>
                    </div>
                    {watchedValues.startDatetime && watchedValues.endDatetime && (
                      <p className="text-sm text-gray-600 mt-2">
                        Durée: {differenceInHours(watchedValues.endDatetime, watchedValues.startDatetime)} heures
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Lieux de prise en charge et retour
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Prise en charge</p>
                        <p className="font-medium">{watchedValues.pickupLocation}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Retour</p>
                        <p className="font-medium">{watchedValues.dropoffLocation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {watchedValues.carSittingOption && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Options sélectionnées
                      </h4>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Service de car sitting (+50€ HT)</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Euro className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Prix total</span>
                      </div>
                      <span className="text-xl font-bold text-green-700">
                        {calculatePrice().toFixed(2)} € TTC
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}


        </CardContent>
      </Card>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStepIndex === 0 ? onCancel : prevStep}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStepIndex === 0 ? 'Annuler' : 'Précédent'}
        </Button>

        <Button
          onClick={handleNextStep}
          disabled={isSubmitting || (currentStep === BookingStep.AVAILABILITY && !availabilityCheck?.isAvailable)}
        >
          {isSubmitting || isCreatingPayment ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {currentStep === BookingStep.CONFIRMATION ? 'Traitement du paiement...' : 'Vérification...'}
            </>
          ) : currentStep === BookingStep.CONFIRMATION ? (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Payer maintenant ({calculatePrice().toFixed(2)} € TTC)
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

             {/* Modal de paiement */}
       {showPaymentModal && paymentClientSecret && paymentInvoiceId && (
         <StripeProvider clientSecret={paymentClientSecret}>
           <PaymentModal
             isOpen={showPaymentModal}
             onClose={handlePaymentModalClose}
             amount={paymentAmount}
             invoiceId={paymentInvoiceId}
             onSuccess={handlePaymentSuccess}
             onError={handlePaymentError}
           />
         </StripeProvider>
       )}
    </div>
  );
}