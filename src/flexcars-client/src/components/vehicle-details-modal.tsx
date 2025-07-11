"use client";

import { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Car, 
  Calendar, 
  Fuel, 
  Gauge, 
  MapPin, 
  Shield, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Wrench
} from 'lucide-react';

import { Vehicle, VehicleStatus, FuelType } from '@/types/vehicle';
import { User } from '@/types/user';
import { CreateReservationRequest } from '@/types/reservation';
import { BookingWizard } from './booking-wizard';
import { cn, calculateTTCPrice } from '@/lib/utils';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onReservationComplete?: (reservation: CreateReservationRequest) => void;
}

enum ModalView {
  DETAILS = 'details',
  BOOKING = 'booking',
}

export function VehicleDetailsModal({ 
  vehicle, 
  user, 
  isOpen, 
  onClose, 
  onReservationComplete 
}: VehicleDetailsModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>(ModalView.DETAILS);

  const handleStartBooking = () => {
    setCurrentView(ModalView.BOOKING);
  };

  const handleBackToDetails = () => {
    setCurrentView(ModalView.DETAILS);
  };

  const handleReservationComplete = (reservationData: CreateReservationRequest) => {
    // La réservation a déjà été créée par le BookingWizard
    // On n'a plus qu'à fermer la modal et rediriger
    console.log('✅ Réservation terminée, redirection vers les réservations');
    onReservationComplete?.(reservationData);
    onClose();
    
    // Rediriger vers la page des réservations
    window.location.href = '/dashboard/reservations';
  };

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case VehicleStatus.RESERVED:
        return 'bg-yellow-100 text-yellow-800';
      case VehicleStatus.RENTED:
        return 'bg-blue-100 text-blue-800';
      case VehicleStatus.MAINTENANCE:
        return 'bg-orange-100 text-orange-800';
      case VehicleStatus.INCIDENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return 'Disponible';
      case VehicleStatus.RESERVED:
        return 'Réservé';
      case VehicleStatus.RENTED:
        return 'Loué';
      case VehicleStatus.MAINTENANCE:
        return 'Maintenance';
      case VehicleStatus.INCIDENT:
        return 'Incident';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return <CheckCircle className="h-4 w-4" />;
      case VehicleStatus.RESERVED:
        return <Clock className="h-4 w-4" />;
      case VehicleStatus.RENTED:
        return <Car className="h-4 w-4" />;
      case VehicleStatus.MAINTENANCE:
        return <Wrench className="h-4 w-4" />;
      case VehicleStatus.INCIDENT:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getFuelTypeIcon = (fuelType: FuelType) => {
    switch (fuelType) {
      case FuelType.ELECTRIC:
        return <Zap className="h-4 w-4" />;
      case FuelType.HYBRID:
        return <Zap className="h-4 w-4" />;
      default:
        return <Fuel className="h-4 w-4" />;
    }
  };

  const getFuelTypeLabel = (fuelType: FuelType) => {
    switch (fuelType) {
      case FuelType.PETROL:
        return 'Essence';
      case FuelType.DIESEL:
        return 'Diesel';
      case FuelType.ELECTRIC:
        return 'Électrique';
      case FuelType.HYBRID:
        return 'Hybride';
      default:
        return fuelType;
    }
  };

  const isAvailable = vehicle.status === VehicleStatus.AVAILABLE;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="!max-w-[95vw] !max-h-[98vh] !w-[95vw] md:!w-[95vw] lg:!w-[92vw] xl:!w-[88vw] 2xl:!w-[85vw] p-0 overflow-hidden sm:!max-w-[95vw] [&>button]:!w-10 [&>button]:!h-10 [&>button>svg]:!w-6 [&>button>svg]:!h-6 [&>button]:!top-6 [&>button]:!right-6 [&>button]:!flex [&>button]:!items-center [&>button]:!justify-center"
        showCloseButton={true}
      >
        <DialogHeader className="px-8 py-6 border-b bg-gray-50/50">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <Car className="h-6 w-6 text-blue-600" />
            <span>
              {currentView === ModalView.DETAILS ? 'Détails du véhicule' : 'Nouvelle réservation'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentView === ModalView.DETAILS && (
            <ScrollArea className="h-[calc(98vh-120px)]">
              <div className="p-8 space-y-8">
                {/* En-tête véhicule - Layout desktop optimisé */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Image du véhicule */}
                    <div className="flex-shrink-0">
                      <div className="w-full lg:w-96 xl:w-[480px] h-64 xl:h-80 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                        {vehicle.imageUrl ? (
                          <Image
                            src={vehicle.imageUrl}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            width={480}
                            height={320}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Car className="h-24 w-24 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Informations principales */}
                    <div className="flex-1 space-y-8">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-2xl xl:text-3xl text-gray-600 mb-6">
                            {vehicle.year} • {vehicle.plateNumber}
                          </p>
                        </div>
                        <Badge className={cn("flex items-center space-x-3 px-6 py-3 text-base", getStatusColor(vehicle.status || VehicleStatus.AVAILABLE))}>
                          {getStatusIcon(vehicle.status || VehicleStatus.AVAILABLE)}
                          <span className="font-semibold">{getStatusLabel(vehicle.status || VehicleStatus.AVAILABLE)}</span>
                        </Badge>
                      </div>

                      {/* Caractéristiques principales - Grid responsive */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border">
                          {getFuelTypeIcon(vehicle.fuelType || FuelType.PETROL)}
                          <div>
                            <p className="text-sm text-gray-500">Carburant</p>
                            <p className="text-lg font-semibold">
                              {getFuelTypeLabel(vehicle.fuelType || FuelType.PETROL)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border">
                          <Gauge className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500">Kilométrage</p>
                            <p className="text-lg font-semibold">
                              {vehicle.currentMileage?.toLocaleString()} km
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-500">Année</p>
                            <p className="text-lg font-semibold">
                              {vehicle.year}
                            </p>
                          </div>
                        </div>
                        {vehicle.gpsEnabled && (
                          <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border">
                            <MapPin className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm text-gray-500">GPS</p>
                              <p className="text-lg font-semibold text-green-600">
                                Activé
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations détaillées - Layout horizontal optimisé */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {/* Spécifications */}
                  <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Car className="h-6 w-6 text-blue-600" />
                      <h4 className="text-xl font-semibold">Spécifications</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium text-lg">Marque</span>
                        <span className="font-semibold text-lg">{vehicle.brand}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium text-lg">Modèle</span>
                        <span className="font-semibold text-lg">{vehicle.model}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium text-lg">Année</span>
                        <span className="font-semibold text-lg">{vehicle.year}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium text-lg">Plaque</span>
                        <span className="font-semibold font-mono text-lg">{vehicle.plateNumber}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium text-lg">Carburant</span>
                        <span className="font-semibold text-lg">{getFuelTypeLabel(vehicle.fuelType || FuelType.PETROL)}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600 font-medium text-lg">Kilométrage</span>
                        <span className="font-semibold text-lg">{vehicle.currentMileage?.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Équipements */}
                  <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Shield className="h-6 w-6 text-green-600" />
                      <h4 className="text-xl font-semibold">Équipements</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 font-medium text-lg">GPS</span>
                        <div className="flex items-center space-x-2">
                          {vehicle.gpsEnabled ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-green-600 font-semibold text-lg">Activé</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-red-600" />
                              <span className="text-red-600 font-semibold text-lg">Désactivé</span>
                            </>
                          )}
                        </div>
                      </div>

                      {vehicle.fuelType === FuelType.ELECTRIC && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 font-medium text-lg">Type d&apos;énergie</span>
                          <div className="flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-green-600" />
                            <span className="text-green-600 font-semibold text-lg">100% Électrique</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tarifs */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-8 shadow-sm lg:col-span-2 xl:col-span-1">
                    <div className="flex items-center space-x-3 mb-6">
                      <Star className="h-6 w-6 text-yellow-500" />
                      <h4 className="text-xl font-semibold">Tarifs</h4>
                    </div>
                    <div className="text-center space-y-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <p className="text-4xl font-bold text-green-600 mb-3">{calculateTTCPrice(25).toFixed(2)}€/heure TTC</p>
                        <p className="text-gray-600 text-lg">
                          Prix dégressif selon la durée de location
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          25€ HT/heure + TVA (20%)
                        </p>
                      </div>
                      <p className="text-gray-500">
                        Options supplémentaires disponibles
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section de réservation - Sticky bottom */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-8 -mb-8 mt-8">
                  {isAvailable ? (
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-600 rounded-full p-4">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-green-900">Véhicule disponible</h4>
                            <p className="text-lg text-green-700">
                              Prêt pour une réservation immédiate
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleStartBooking}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg"
                        >
                          Réserver maintenant
                          <ArrowRight className="h-6 w-6 ml-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center space-x-4 justify-center lg:justify-start">
                        <div className="bg-red-600 rounded-full p-4">
                          <AlertCircle className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center lg:text-left">
                          <h4 className="text-2xl font-bold text-red-900">Véhicule indisponible</h4>
                          <p className="text-lg text-red-700">
                            Ce véhicule n&apos;est pas disponible pour le moment
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          {currentView === ModalView.BOOKING && (
            <ScrollArea className="h-[calc(98vh-120px)]">
              <div className="p-6">
                <BookingWizard
                  vehicle={vehicle}
                  user={user}
                  onComplete={handleReservationComplete}
                  onCancel={handleBackToDetails}
                />
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 