"use client";

import { useState } from 'react';
import { format, isSameDay, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  User, 
  Car, 
  MapPin, 
  Eye
} from 'lucide-react';

import { 
  Reservation, 
  ReservationStatus, 
  Location 
} from '@/types/reservation';
import { Vehicle } from '@/types/vehicle';
import { cn } from '@/lib/utils';

interface SimpleReservationCalendarProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onReservationSelect: (reservation: Reservation) => void;
  onNewReservation: (date: Date) => void;
  className?: string;
}

export function SimpleReservationCalendar({
  reservations,
  vehicles,
  selectedDate,
  onDateSelect,
  onReservationSelect,
  onNewReservation,
  className,
}: SimpleReservationCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(selectedDate);

  // Obtenir les réservations pour une date donnée
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startDatetime);
      const endDate = new Date(reservation.endDatetime);
      
      return (
        isSameDay(startDate, date) || 
        isSameDay(endDate, date) ||
        (isAfter(date, startOfDay(startDate)) && isBefore(date, endOfDay(endDate)))
      );
    });
  };

  // Obtenir les réservations pour le jour sélectionné
  const selectedDateReservations = getReservationsForDate(selectedDate);

  // Fonction pour déterminer si une date a des réservations
  const hasReservations = (date: Date) => {
    return getReservationsForDate(date).length > 0;
  };

  // Fonction pour obtenir le statut majoritaire d'une date
  const getDateStatus = (date: Date): ReservationStatus | null => {
    const dayReservations = getReservationsForDate(date);
    if (dayReservations.length === 0) return null;
    
    // Prioriser les statuts (picked_up > confirmed > pickup_requested > pending > cancelled > completed)
    const statusPriority = {
      [ReservationStatus.PICKED_UP]: 6,
      [ReservationStatus.CONFIRMED]: 5,
      [ReservationStatus.PICKUP_REQUESTED]: 4,
      [ReservationStatus.PENDING]: 3,
      [ReservationStatus.CANCELLED]: 2,
      [ReservationStatus.COMPLETED]: 1,
    };
    
    return dayReservations.reduce((prevReservation, currReservation) => 
      statusPriority[currReservation.status] > statusPriority[prevReservation.status] ? currReservation : prevReservation
    ).status;
  };

  // Customiser l'apparence des dates
  const modifiers = {
    hasReservations: (date: Date) => hasReservations(date),
    pickedUp: (date: Date) => getDateStatus(date) === ReservationStatus.PICKED_UP,
    confirmed: (date: Date) => getDateStatus(date) === ReservationStatus.CONFIRMED,
    pickupRequested: (date: Date) => getDateStatus(date) === ReservationStatus.PICKUP_REQUESTED,
    pending: (date: Date) => getDateStatus(date) === ReservationStatus.PENDING,
    cancelled: (date: Date) => getDateStatus(date) === ReservationStatus.CANCELLED,
    completed: (date: Date) => getDateStatus(date) === ReservationStatus.COMPLETED,
  };

  const modifiersStyles = {
    hasReservations: {
      fontWeight: 'bold',
    },
    pickedUp: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    confirmed: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    pickupRequested: {
      backgroundColor: '#fed7aa',
      color: '#c2410c',
    },
    pending: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    cancelled: {
      backgroundColor: '#fecaca',
      color: '#991b1b',
    },
    completed: {
      backgroundColor: '#e9d5ff',
      color: '#6b21a8',
    },
  };

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PICKED_UP:
        return 'Véhicule récupéré';
      case ReservationStatus.CONFIRMED:
        return 'Confirmé';
      case ReservationStatus.PICKUP_REQUESTED:
        return 'Pickup demandé';
      case ReservationStatus.PENDING:
        return 'En attente';
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
      case ReservationStatus.PICKED_UP:
        return 'bg-blue-100 text-blue-800';
      case ReservationStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case ReservationStatus.PICKUP_REQUESTED:
        return 'bg-orange-100 text-orange-800';
      case ReservationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ReservationStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ReservationStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: fr });
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* Calendrier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Calendrier</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Légende */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                <span>En attente</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>Confirmé</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-200 rounded"></div>
                <span>Pickup demandé</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>Récupéré</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span>Annulé</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-purple-200 rounded"></div>
                <span>Terminé</span>
              </div>
            </div>

            {/* Composant Calendar */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateSelect(date)}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={fr}
              className="rounded-md border w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Réservations du jour sélectionné */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </span>
            </CardTitle>
            <Button
              size="sm"
              onClick={() => onNewReservation(selectedDate)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouveau
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {selectedDateReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune réservation pour cette date</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => onNewReservation(selectedDate)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Créer une réservation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateReservations.map((reservation) => {
                  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
                  const startTime = new Date(reservation.startDatetime);
                  const endTime = new Date(reservation.endDatetime);
                  
                  return (
                    <div
                      key={reservation.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onReservationSelect(reservation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getStatusColor(reservation.status)}>
                              {getStatusLabel(reservation.status)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {formatTime(startTime)} - {formatTime(endTime)}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Car className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule inconnu'}
                              </span>
                              {vehicle && (
                                <Badge variant="outline" className="text-xs">
                                  {vehicle.plateNumber}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {reservation.customer?.firstName} {reservation.customer?.lastName}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {getLocationLabel(reservation.pickupLocation)} → {getLocationLabel(reservation.dropoffLocation)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReservationSelect(reservation);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 