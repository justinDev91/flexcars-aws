"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours, isBefore, isAfter } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Car, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Euro,
  Settings,
  X
} from 'lucide-react';

import {
  Reservation,
  ReservationStatus,
  Location,
  CreateReservationRequest,
  UpdateReservationRequest,
  AvailabilityCheckResponse
} from '@/types/reservation';
import { Vehicle } from '@/types/vehicle';
import { User as UserType } from '@/types/user';
import { reservationApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Schéma de validation Zod
const reservationSchema = z.object({
  vehicleId: z.string().min(1, 'Veuillez sélectionner un véhicule'),
  customerId: z.string().min(1, 'ID client requis'),
  startDatetime: z.date({
    required_error: 'Date de début requise',
    invalid_type_error: 'Date de début invalide',
  }),
  endDatetime: z.date({
    required_error: 'Date de fin requise',
    invalid_type_error: 'Date de fin invalide',
  }),
  pickupLocation: z.nativeEnum(Location).optional(),
  dropoffLocation: z.nativeEnum(Location).optional(),
  carSittingOption: z.boolean().optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
}).refine(
  (data) => isBefore(data.startDatetime, data.endDatetime),
  {
    message: 'La date de fin doit être après la date de début',
    path: ['endDatetime'],
  }
).refine(
  (data) => isAfter(data.startDatetime, new Date()),
  {
    message: 'La date de début doit être dans le futur',
    path: ['startDatetime'],
  }
);

type FormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  reservation?: Reservation;
  vehicles: Vehicle[];
  currentUser: UserType;
  isEditing?: boolean;
  onSubmit: (data: CreateReservationRequest | UpdateReservationRequest) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function ReservationForm({
  reservation,
  vehicles,
  currentUser,
  isEditing = false,
  onSubmit,
  onCancel,
  className,
}: ReservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [availabilityCheck, setAvailabilityCheck] = useState<AvailabilityCheckResponse | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      vehicleId: reservation?.vehicleId || '',
      customerId: reservation?.customerId || currentUser.id,
      startDatetime: reservation?.startDatetime ? new Date(reservation.startDatetime) : addHours(new Date(), 1),
      endDatetime: reservation?.endDatetime ? new Date(reservation.endDatetime) : addHours(new Date(), 3),
      pickupLocation: reservation?.pickupLocation || Location.SAINT_DENIS,
      dropoffLocation: reservation?.dropoffLocation || Location.ISSY_LES_MOULINEAUX,
      carSittingOption: reservation?.carSittingOption || false,
      status: reservation?.status || ReservationStatus.PENDING,
    },
  });

  const { watch } = form;
  const watchedValues = watch();

  // Vérifier la disponibilité lorsque les données changent
  const checkAvailability = useCallback(async () => {
    if (!watchedValues.vehicleId || !watchedValues.startDatetime || !watchedValues.endDatetime) {
      setAvailabilityCheck(null);
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await reservationApi.checkAvailability({
        vehicleId: watchedValues.vehicleId,
        startDatetime: watchedValues.startDatetime,
        endDatetime: watchedValues.endDatetime,
        excludeReservationId: reservation?.id,
      });
      setAvailabilityCheck(response);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      setAvailabilityCheck({
        isAvailable: false,
        message: 'Erreur lors de la vérification de disponibilité',
      });
    } finally {
      setCheckingAvailability(false);
    }
  }, [watchedValues.vehicleId, watchedValues.startDatetime, watchedValues.endDatetime, reservation?.id]);

  // Déclencher la vérification de disponibilité avec un délai
  useEffect(() => {
    const timeout = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeout);
  }, [checkAvailability]);

  // Calculer le prix estimé
  useEffect(() => {
    if (watchedValues.startDatetime && watchedValues.endDatetime) {
      const duration = watchedValues.endDatetime.getTime() - watchedValues.startDatetime.getTime();
      const hours = Math.ceil(duration / (1000 * 60 * 60));
      const basePrice = 25; // Prix de base par heure
      const estimated = hours * basePrice;
      setEstimatedPrice(estimated);
    }
  }, [watchedValues.startDatetime, watchedValues.endDatetime]);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await onSubmit(data as UpdateReservationRequest);
      } else {
        await onSubmit(data as CreateReservationRequest);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'En attente';
      case ReservationStatus.CONFIRMED:
        return 'Confirmé';
      case ReservationStatus.CANCELLED:
        return 'Annulé';
      case ReservationStatus.COMPLETED:
        return 'Terminé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ReservationStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case ReservationStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ReservationStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === watchedValues.vehicleId);

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>
              {isEditing ? 'Modifier la réservation' : 'Nouvelle réservation'}
            </span>
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Sélection du véhicule */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Véhicule</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un véhicule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center space-x-2">
                            <span>{vehicle.brand} {vehicle.model}</span>
                            <Badge variant="outline" className="text-xs">
                              {vehicle.plateNumber}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informations sur le véhicule sélectionné */}
            {selectedVehicle && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {selectedVehicle.imageUrl ? (
                      <Image 
                        src={selectedVehicle.imageUrl} 
                        alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                        className="w-full h-full object-cover rounded-lg"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <Car className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedVehicle.year} • {selectedVehicle.fuelType} • {selectedVehicle.plateNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedVehicle.currentMileage?.toLocaleString()} km
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dates et heures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDatetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Date et heure de début</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDatetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Date et heure de fin</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        min={watchedValues.startDatetime ? format(watchedValues.startDatetime, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Lieu de récupération</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="dropoffLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Lieu de retour</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            </div>

            {/* Options */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="carSittingOption"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">
                        Option Car Sitting
                      </FormLabel>
                      <FormDescription>
                        Un car sitter peut livrer et récupérer le véhicule
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Statut (seulement en édition) */}
              {isEditing && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Statut</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ReservationStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(status)}>
                                  {getStatusLabel(status)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Vérification de disponibilité */}
            {availabilityCheck && (
              <Alert className={availabilityCheck.isAvailable ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                <div className="flex items-center space-x-2">
                  {availabilityCheck.isAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={availabilityCheck.isAvailable ? 'text-green-800' : 'text-red-800'}>
                    {availabilityCheck.message || 
                     (availabilityCheck.isAvailable ? 'Véhicule disponible' : 'Véhicule non disponible')}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Prix estimé */}
            {estimatedPrice && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Euro className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Prix estimé TTC :</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {estimatedPrice.toFixed(2)} € TTC
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  (dont {(estimatedPrice * 0.2 / 1.2).toFixed(2)}€ de TVA)
                </div>
              </div>
            )}

            <Separator />

            {/* Boutons d'action */}
            <div className="flex items-center justify-between space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                disabled={loading || checkingAvailability || Boolean(availabilityCheck && !availabilityCheck.isAvailable)}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  <>
                    {isEditing ? 'Modifier' : 'Créer'} la réservation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 