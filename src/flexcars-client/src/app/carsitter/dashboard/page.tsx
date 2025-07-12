"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Car,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  LogOut,
  Calendar,
  FileText,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/auth-context';
import { Role } from '@/types';
import { carSitterApi } from '@/lib/api';

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
      plateNumber: string;
      year: number;
    };
    startDatetime: string;
    endDatetime: string;
  };
}

interface DropoffRequest {
  id: string;
  reservationId: string;
  carSitterId: string;
  currentMileage: number;
  dropoffTime: string;
  hasAccident: boolean;
  locationLat: number;
  locationLng: number;
  signature?: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  penaltyAmount?: number;
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
      plateNumber: string;
      year: number;
    };
    startDatetime: string;
    endDatetime: string;
  };
}

export default function CarSitterDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [dropoffRequests, setDropoffRequests] = useState<DropoffRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCarSitterRequests = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingRequests(true);
      setError(null);
      
      // Charger les demandes de pickup et dropoff assignées à ce car sitter
      const [pickupResponse, dropoffResponse] = await Promise.all([
        carSitterApi.getMyPickupRequests(user.id),
        carSitterApi.getMyDropoffRequests(user.id)
      ]);

      setPickupRequests(pickupResponse.data as PickupRequest[]);
      setDropoffRequests(dropoffResponse.data as DropoffRequest[]);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      // Pour l'instant, on initialise avec des tableaux vides au lieu d'afficher une erreur
      setPickupRequests([]);
      setDropoffRequests([]);
      // setError('Impossible de charger vos demandes');
    } finally {
      setLoadingRequests(false);
    }
  }, [user?.id]);

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
      loadCarSitterRequests();
    }
  }, [isLoading, isAuthenticated, user, router, loadCarSitterRequests]);

  const handleValidatePickup = async (pickupId: string, isValidated: boolean, notes?: string) => {
    try {
      await carSitterApi.validatePickup({
        pickupRequestId: pickupId,
        isValidated,
        notes
      });

      toast.success(isValidated ? 'Pickup validé avec succès' : 'Pickup rejeté');
      await loadCarSitterRequests();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const handleValidateDropoff = async (dropoffId: string, isValidated: boolean, notes?: string) => {
    try {
      await carSitterApi.validateDropoff({
        dropoffRequestId: dropoffId,
        isValidated,
        notes
      });

      toast.success(isValidated ? 'Dropoff validé avec succès' : 'Dropoff rejeté');
      await loadCarSitterRequests();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== Role.CARSITTER) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Car Sitter
            </h1>
            <p className="text-gray-600">
              Bienvenue {user?.firstName} {user?.lastName} - Gérez vos demandes de validation
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Erreur */}
        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pickup en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pickupRequests.filter(r => r.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dropoff en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {dropoffRequests.filter(r => r.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Validations aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {[...pickupRequests, ...dropoffRequests].filter(r => 
                  r.status === 'VALIDATED' && 
                  r.validatedAt && 
                  new Date(r.validatedAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {pickupRequests.length + dropoffRequests.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <Tabs defaultValue="pickup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pickup">
              Demandes de Pickup ({pickupRequests.length})
            </TabsTrigger>
            <TabsTrigger value="dropoff">
              Demandes de Dropoff ({dropoffRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pickup" className="space-y-4">
            {loadingRequests ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Chargement des demandes...
              </div>
            ) : pickupRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Aucune demande de pickup</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pickupRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          {request.reservation.vehicle.brand} {request.reservation.vehicle.model}
                        </CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusLabel(request.status)}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        Demande de pickup - {request.reservation.vehicle.plateNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Client:</span>
                            <span>
                              {request.reservation.customer.firstName} {request.reservation.customer.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Heure demandée:</span>
                            <span>
                              {new Date(request.requestedTime).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Lieu:</span>
                            <span>{request.pickupLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Créée le:</span>
                            <span>
                              {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {request.carSitterNotes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <FileText className="h-4 w-4" />
                            Notes:
                          </div>
                          <p className="text-sm">{request.carSitterNotes}</p>
                        </div>
                      )}

                      {request.status === 'PENDING' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            onClick={() => handleValidatePickup(request.id, true)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Valider
                          </Button>
                          <Button
                            onClick={() => handleValidatePickup(request.id, false)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dropoff" className="space-y-4">
            {loadingRequests ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Chargement des demandes...
              </div>
            ) : dropoffRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Aucune demande de dropoff</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {dropoffRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          {request.reservation.vehicle.brand} {request.reservation.vehicle.model}
                        </CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusLabel(request.status)}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        Demande de dropoff - {request.reservation.vehicle.plateNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Client:</span>
                            <span>
                              {request.reservation.customer.firstName} {request.reservation.customer.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Heure retour:</span>
                            <span>
                              {new Date(request.dropoffTime).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm">
                            <Navigation className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Kilométrage:</span>
                            <span>{request.currentMileage} km</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Créée le:</span>
                            <span>
                              {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {request.hasAccident && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Accident déclaré</strong> - Vérification requise
                          </AlertDescription>
                        </Alert>
                      )}

                      {request.penaltyAmount && request.penaltyAmount > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Pénalité appliquée:</strong> {request.penaltyAmount}€
                          </AlertDescription>
                        </Alert>
                      )}

                      {request.carSitterNotes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <FileText className="h-4 w-4" />
                            Notes:
                          </div>
                          <p className="text-sm">{request.carSitterNotes}</p>
                        </div>
                      )}

                      {request.status === 'PENDING' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            onClick={() => handleValidateDropoff(request.id, true)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Valider
                          </Button>
                          <Button
                            onClick={() => handleValidateDropoff(request.id, false)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 