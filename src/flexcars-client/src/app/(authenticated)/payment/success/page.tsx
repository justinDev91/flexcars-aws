'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Car, Calendar, MapPin, Euro, Clock, User, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { reservationApi } from '@/lib/api';
import { Reservation } from '@/types/reservation';
import { LOCATION_LABELS } from '@/lib/constants';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les paramètres de l'URL
  const reservationId = searchParams.get('reservationId');
  const paymentIntentId = searchParams.get('payment_intent');
  const amount = searchParams.get('amount');

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

  const formatDateTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <CheckCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleGoToDashboard} variant="outline">
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-3xl text-green-700 mb-2">
            Paiement réussi !
          </CardTitle>
          <CardDescription className="text-lg">
            Votre réservation a été confirmée avec succès
          </CardDescription>
          {paymentIntentId && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                ID Transaction: {paymentIntentId.substring(0, 20)}...
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Montant payé */}
          {amount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2">
                <Euro className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">
                  {(parseInt(amount) / 100).toFixed(2)} € TTC
                </span>
              </div>
              <p className="text-center text-sm text-green-600 mt-1">
                Montant débité avec succès
              </p>
            </div>
          )}

          {reservation && (
            <>
              <Separator />

              {/* Détails de la réservation */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Détails de votre réservation
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Informations du véhicule */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Véhicule</h4>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Modèle:</span> {reservation.vehicle?.brand} {reservation.vehicle?.model}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Année:</span> {reservation.vehicle?.year}
                        </p>
                                                 <p className="text-sm">
                           <span className="font-medium">Plaque:</span> {reservation.vehicle?.plateNumber}
                         </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Options</h4>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Car Sitter:</span> {reservation.carSittingOption ? 'Oui' : 'Non'}
                        </p>
                        {reservation.totalPrice && (
                          <p className="text-sm">
                            <span className="font-medium">Prix total:</span> {reservation.totalPrice.toFixed(2)} € TTC
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Dates et lieux */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Dates
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Début:</span>
                          <br />
                          {formatDateTime(reservation.startDatetime)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Fin:</span>
                          <br />
                          {formatDateTime(reservation.endDatetime)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Lieux
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Récupération:</span>
                          <br />
                          {LOCATION_LABELS[reservation.pickupLocation] || reservation.pickupLocation}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Retour:</span>
                          <br />
                          {LOCATION_LABELS[reservation.dropoffLocation] || reservation.dropoffLocation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Prochaines étapes */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prochaines étapes
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Confirmation par email</p>
                        <p className="text-sm text-blue-700">
                          Vous recevrez un email de confirmation avec tous les détails de votre réservation.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Récupération du véhicule</p>
                        <p className="text-sm text-blue-700">
                          Vous pourrez récupérer votre véhicule 30 minutes avant l'heure de début prévue.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1">
                        <span className="text-blue-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Suivi de votre réservation</p>
                        <p className="text-sm text-blue-700">
                          Retrouvez toutes vos réservations dans votre tableau de bord.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={handleViewReservations}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              Voir mes réservations
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              onClick={handleGoToDashboard}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <User className="h-5 w-5 mr-2" />
              Tableau de bord
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentSuccessLoading() {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
} 