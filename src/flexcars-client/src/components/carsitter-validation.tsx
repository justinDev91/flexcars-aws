"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  XCircle,
  Car,
  User,
  MapPin,
  Clock,
  Gauge,
  AlertTriangle,
  Loader2,
  FileText,
  Calendar
} from 'lucide-react';

import { carSitterApi } from '@/lib/api';

const validationSchema = z.object({
  isValidated: z.boolean(),
  notes: z.string().optional(),
});

type ValidationFormData = z.infer<typeof validationSchema>;

interface DropoffRequest {
  id: string;
  reservationId: string;
  currentMileage: number;
  dropoffTime: string;
  hasAccident: boolean;
  locationLat: number;
  locationLng: number;
  signature?: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  penaltyAmount: number;
  createdAt: string;
  reservation: {
    id: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    };
    vehicle: {
      brand: string;
      model: string;
      plateNumber: string;
      imageUrl?: string;
    };
    startDatetime: string;
    endDatetime: string;
  };
}

interface CarSitterValidationProps {
  dropoffRequestId: string;
  onValidationComplete?: (validated: boolean) => void;
}

export function CarSitterValidation({ dropoffRequestId, onValidationComplete }: CarSitterValidationProps) {
  const [dropoffRequest, setDropoffRequest] = useState<DropoffRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ValidationFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      isValidated: false,
      notes: '',
    },
  });

  const loadDropoffRequest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await carSitterApi.getDropoffRequest(dropoffRequestId);
      setDropoffRequest(response.data as DropoffRequest);
    } catch (error) {
      console.error('Erreur lors du chargement de la demande:', error);
      toast.error('Impossible de charger la demande de dropoff');
    } finally {
      setLoading(false);
    }
  }, [dropoffRequestId]);

  useEffect(() => {
    loadDropoffRequest();
  }, [loadDropoffRequest]);

  const handleValidation = async (data: ValidationFormData) => {
    try {
      setSubmitting(true);
      
      await carSitterApi.validateDropoff({
        dropoffRequestId,
        isValidated: data.isValidated,
        notes: data.notes,
      });

      toast.success(
        data.isValidated 
          ? 'Dropoff validé avec succès !' 
          : 'Dropoff rejeté. Le client en sera informé.'
      );

      onValidationComplete?.(data.isValidated);
    } catch (error: unknown) {
      console.error('Erreur lors de la validation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la validation';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = () => {
    form.setValue('isValidated', true);
    form.handleSubmit(handleValidation)();
  };

  const handleReject = () => {
    form.setValue('isValidated', false);
    form.handleSubmit(handleValidation)();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement de la demande...</p>
        </div>
      </div>
    );
  }

  if (!dropoffRequest) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Demande introuvable</h2>
        <p className="text-muted-foreground">
          Cette demande de dropoff n'existe pas ou n'est plus disponible.
        </p>
      </div>
    );
  }

  if (dropoffRequest.status !== 'PENDING') {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          {dropoffRequest.status === 'VALIDATED' ? (
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">Demande déjà traitée</h2>
        <p className="text-muted-foreground">
          Cette demande a déjà été {dropoffRequest.status === 'VALIDATED' ? 'validée' : 'rejetée'}.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Validation de retour de véhicule</h1>
        <p className="text-muted-foreground">
          Vérifiez les informations ci-dessous et validez le retour du véhicule
        </p>
      </div>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations client
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Nom du client</Label>
            <p className="font-medium">
              {dropoffRequest.reservation.customer.firstName} {dropoffRequest.reservation.customer.lastName}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="font-medium">{dropoffRequest.reservation.customer.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Téléphone</Label>
            <p className="font-medium">
              {dropoffRequest.reservation.customer.phoneNumber || 'Non renseigné'}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">ID réservation</Label>
            <p className="font-medium font-mono text-sm">
              {dropoffRequest.reservationId.slice(0, 8)}...
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations véhicule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Véhicule
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-muted-foreground">Marque et modèle</Label>
            <p className="font-medium">
              {dropoffRequest.reservation.vehicle.brand} {dropoffRequest.reservation.vehicle.model}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Plaque d'immatriculation</Label>
            <p className="font-medium">{dropoffRequest.reservation.vehicle.plateNumber}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Kilométrage</Label>
            <p className="font-medium flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              {dropoffRequest.currentMileage.toLocaleString()} km
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Détails du retour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Détails du retour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Heure de retour</Label>
              <p className="font-medium">
                {new Date(dropoffRequest.dropoffTime).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Localisation</Label>
              <p className="font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {dropoffRequest.locationLat.toFixed(6)}, {dropoffRequest.locationLng.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-muted-foreground">Accident signalé</Label>
              <div className="mt-1">
                <Badge variant={dropoffRequest.hasAccident ? 'destructive' : 'secondary'}>
                  {dropoffRequest.hasAccident ? 'Oui - Accident signalé' : 'Non - Aucun accident'}
                </Badge>
              </div>
            </div>
            
            {dropoffRequest.penaltyAmount > 0 && (
              <div>
                <Label className="text-muted-foreground">Pénalité</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-orange-600">
                    {dropoffRequest.penaltyAmount}€ TTC
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {dropoffRequest.signature && (
            <div>
              <Label className="text-muted-foreground">Signature / Commentaire du client</Label>
              <div className="mt-1 p-3 bg-muted rounded-lg">
                <p className="text-sm">{dropoffRequest.signature}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Période de location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période de location
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Début de location</Label>
            <p className="font-medium">
              {new Date(dropoffRequest.reservation.startDatetime).toLocaleString('fr-FR')}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Fin prévue</Label>
            <p className="font-medium">
              {new Date(dropoffRequest.reservation.endDatetime).toLocaleString('fr-FR')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Validation du retour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleValidation)} className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes et observations (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez vos observations sur l'état du véhicule, le comportement du client, etc."
                {...form.register('notes')}
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important :</strong> Vérifiez attentivement l'état du véhicule avant de valider.
                En validant, vous confirmez que le retour s'est déroulé correctement.
              </AlertDescription>
            </Alert>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReject}
                disabled={submitting}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                {submitting && !form.watch('isValidated') && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter le retour
              </Button>

              <Button
                type="button"
                onClick={handleAccept}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting && form.watch('isValidated') && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <CheckCircle className="mr-2 h-4 w-4" />
                Valider le retour
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 