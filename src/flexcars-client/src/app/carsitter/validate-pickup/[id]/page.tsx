'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, Car, User, Calendar, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { Role } from '@/types';
import { apiClient } from '@/lib/api';

interface PickupRequest {
  id: string;
  reservationId: string;
  carSitterId: string;
  requestedTime: string;
  pickupLocation: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  carSitterNotes?: string;
  validatedAt?: string;
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
      licensePlate: string;
      year: number;
      color: string;
    };
    startDatetime: string;
    endDatetime: string;
  };
  carSitter: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function ValidatePickupPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [pickupRequest, setPickupRequest] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchPickupRequest = useCallback(async () => {
    try {
      const response = await apiClient.get(`/car-sitters/pickup-request/${params.id}`);
      const request = response.data as PickupRequest;
      
      // Vérification que le car sitter connecté peut valider cette demande
      if (user && request.carSitterId !== user.id) {
        toast.error('Vous n\'êtes pas autorisé à valider cette demande');
        router.push('/carsitter/dashboard');
        return;
      }
      
      setPickupRequest(request);
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      toast.error('Demande de pickup introuvable');
    } finally {
      setLoading(false);
    }
  }, [params.id, user, router]);

  // Vérification de l'authentification et du rôle
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Authentification requise');
      router.push('/auth/login');
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== Role.CARSITTER) {
      toast.error('Accès refusé - Vous n\'êtes pas un car sitter');
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.role === Role.CARSITTER) {
      fetchPickupRequest();
    }
  }, [isLoading, isAuthenticated, user, router, params.id, fetchPickupRequest]);

  const handleValidation = async (isValidated: boolean) => {
    if (!pickupRequest) return;

    setValidating(true);
    try {
      const response = await apiClient.post('/car-sitters/validate-pickup', {
        pickupRequestId: pickupRequest.id,
        isValidated,
        notes: notes.trim() || undefined
      });

      toast.success((response.data as { message?: string })?.message || 'Demande traitée avec succès');
      
      // Recharger les données pour afficher le nouveau statut
      await fetchPickupRequest();
      
      // Rediriger vers le dashboard car sitter après validation
      setTimeout(() => {
        router.push('/carsitter/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'VALIDATED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'VALIDATED': return 'Validée';
      case 'REJECTED': return 'Refusée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'VALIDATED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Écran de chargement pour l'authentification
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Vérification de l'authentification...</span>
        </div>
      </div>
    );
  }

  // Redirection en cours si pas authentifié ou mauvais rôle
  if (!isAuthenticated || user?.role !== Role.CARSITTER) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement de la demande...</span>
        </div>
      </div>
    );
  }

  if (!pickupRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Demande introuvable
            </CardTitle>
            <CardDescription>
              La demande de pickup que vous cherchez n'existe pas ou a été supprimée.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isAlreadyProcessed = pickupRequest.status !== 'PENDING';

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Validation de pickup
          </CardTitle>
          <CardDescription>
            Demande de pickup du véhicule par un client
          </CardDescription>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(pickupRequest.status)}>
              {getStatusIcon(pickupRequest.status)}
              <span className="ml-1">{getStatusLabel(pickupRequest.status)}</span>
            </Badge>
            {pickupRequest.validatedAt && (
              <span className="text-sm text-gray-500">
                Traitée le {new Date(pickupRequest.validatedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informations du client */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations du client
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Nom:</span>
                <span className="text-sm">{pickupRequest.reservation.customer.firstName} {pickupRequest.reservation.customer.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{pickupRequest.reservation.customer.email}</span>
              </div>
              {pickupRequest.reservation.customer.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Téléphone:</span>
                  <span className="text-sm">{pickupRequest.reservation.customer.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informations du véhicule */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Véhicule
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Modèle:</span>
                <span className="text-sm">{pickupRequest.reservation.vehicle.brand} {pickupRequest.reservation.vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Année:</span>
                <span className="text-sm">{pickupRequest.reservation.vehicle.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Couleur:</span>
                <span className="text-sm">{pickupRequest.reservation.vehicle.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Plaque:</span>
                <span className="text-sm font-mono">{pickupRequest.reservation.vehicle.licensePlate}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Détails du pickup */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Détails du pickup
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Heure demandée:</span>
                <span className="text-sm">{new Date(pickupRequest.requestedTime).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Lieu:</span>
                <span className="text-sm">{pickupRequest.pickupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Période de location:</span>
                <span className="text-sm">
                  Du {new Date(pickupRequest.reservation.startDatetime).toLocaleDateString('fr-FR')} 
                  au {new Date(pickupRequest.reservation.endDatetime).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Notes du carsitter (affichage ou saisie) */}
          {isAlreadyProcessed && pickupRequest.carSitterNotes ? (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes du carsitter
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">{pickupRequest.carSitterNotes}</p>
              </div>
            </div>
          ) : !isAlreadyProcessed ? (
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (optionnel)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes sur le pickup..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          ) : null}

          {/* Boutons d'action */}
          {!isAlreadyProcessed && (
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => handleValidation(true)}
                disabled={validating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {validating ? 'Validation...' : 'Valider le pickup'}
              </Button>
              <Button
                onClick={() => handleValidation(false)}
                disabled={validating}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {validating ? 'Refus...' : 'Refuser le pickup'}
              </Button>
            </div>
          )}

          {/* Message si déjà traité */}
          {isAlreadyProcessed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Demande déjà traitée</p>
                  <p className="text-sm text-blue-700">
                    Cette demande a déjà été {pickupRequest.status === 'VALIDATED' ? 'validée' : 'refusée'} 
                    le {new Date(pickupRequest.validatedAt!).toLocaleDateString('fr-FR')}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 