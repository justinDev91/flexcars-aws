'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Car, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  Key,
  Settings,
  Phone,
  AlertCircle,
  FileText,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import { reservationApi } from '@/lib/api';
import { Reservation } from '@/types/reservation';
import { LOCATION_LABELS } from '@/lib/constants';

function PickupSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les paramètres de l'URL
  const reservationId = searchParams.get('reservationId');
  const pickupType = searchParams.get('pickupType') || 'normal';

  const fetchReservationDetails = useCallback(async () => {
    try {
      const response = await reservationApi.getReservation(reservationId!);
      setReservation(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation:', error);
      setError('Impossible de récupérer les détails de la réservation');
      toast.error('Erreur lors de la récupération des détails');
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    if (reservationId) {
      fetchReservationDetails();
    } else {
      setError('Aucune réservation spécifiée');
      setLoading(false);
    }
  }, [reservationId, fetchReservationDetails]);

  const handleViewReservations = () => {
    router.push('/dashboard/reservations');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Réservation introuvable'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* En-tête de confirmation */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              🎉 Véhicule récupéré avec succès !
            </CardTitle>
            <CardDescription className="text-green-700">
              {pickupType === 'carsitter' 
                ? 'Votre demande de pickup avec carsitter a été créée. Vous recevrez une notification dès que le carsitter aura validé la récupération.'
                : 'Votre véhicule est maintenant à votre disposition. Bonne route !'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Détails du véhicule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Détails du véhicule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Véhicule</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {reservation.vehicle?.brand} {reservation.vehicle?.model}
                    </span>
                    <Badge variant="outline">
                      {reservation.vehicle?.year}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Plaque : {reservation.vehicle?.plateNumber}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Kilométrage</h4>
                  <p className="text-sm">
                    {reservation.vehicle?.currentMileage?.toLocaleString('fr-FR')} km
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Carburant</h4>
                  <Badge variant="secondary">
                    {reservation.vehicle?.fuelType || 'Non spécifié'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Période de location
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Début:</span><br />
                      {formatDate(reservation.startDatetime)} à {formatTime(reservation.startDatetime)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Fin:</span><br />
                      {formatDate(reservation.endDatetime)} à {formatTime(reservation.endDatetime)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Retour prévu
                  </h4>
                  <div className="text-sm">
                    {LOCATION_LABELS[reservation.dropoffLocation] || reservation.dropoffLocation}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prochaines étapes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Prochaines étapes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium">Profitez de votre véhicule</h4>
                  <p className="text-sm text-gray-600">
                    Votre véhicule est maintenant à votre disposition. Vérifiez l'état général et prenez la route !
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-medium">Respectez l'heure de retour</h4>
                  <p className="text-sm text-gray-600">
                    Retournez le véhicule avant le {formatDate(reservation.endDatetime)} à {formatTime(reservation.endDatetime)} pour éviter les frais de retard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Retour du véhicule</h4>
                  <p className="text-sm text-gray-600">
                    Rendez-vous à {LOCATION_LABELS[reservation.dropoffLocation] || reservation.dropoffLocation} pour le retour. Un bouton "Rendre le véhicule" sera disponible dans vos réservations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium">Assistance</h4>
                  <p className="text-sm text-gray-600">
                    En cas de problème, contactez notre support ou consultez vos réservations dans votre tableau de bord.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations importantes */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Rappel important :</strong> Veuillez inspecter le véhicule avant de partir. 
            En cas de dommage constaté, signalez-le immédiatement via l'application ou contactez notre support.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleViewReservations} size="lg" className="flex-1 sm:flex-none">
            <FileText className="h-4 w-4 mr-2" />
            Voir mes réservations
          </Button>
          <Button onClick={handleGoToDashboard} variant="outline" size="lg" className="flex-1 sm:flex-none">
            <Settings className="h-4 w-4 mr-2" />
            Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PickupSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      </div>
    }>
      <PickupSuccessContent />
    </Suspense>
  );
} 