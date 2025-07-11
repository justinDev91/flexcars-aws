import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Car, Fuel, MapPin, Settings } from "lucide-react";
import { Vehicle, FuelType, VehicleStatus } from "@/types/vehicle";
import Image from "next/image";

interface VehicleCardProps {
  vehicle: Vehicle;
  onReserve?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
}

const getFuelTypeLabel = (fuelType: FuelType): string => {
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
      return 'Non spécifié';
  }
};

const getStatusColor = (status: VehicleStatus): string => {
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

const getStatusLabel = (status: VehicleStatus): string => {
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
      return 'Statut inconnu';
  }
};

export function VehicleCard({ vehicle, onReserve, onViewDetails }: VehicleCardProps) {
  const isAvailable = vehicle.status === VehicleStatus.AVAILABLE;

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {vehicle.brand} {vehicle.model}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              {vehicle.year || 'Année non spécifiée'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(vehicle.status || VehicleStatus.AVAILABLE)}>
            {getStatusLabel(vehicle.status || VehicleStatus.AVAILABLE)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Image du véhicule */}
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
          {vehicle.imageUrl ? (
            <Image 
              src={vehicle.imageUrl} 
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Car className="h-12 w-12 mb-2" />
              <span className="text-sm">Pas d&apos;image</span>
            </div>
          )}
        </div>

        {/* Informations du véhicule */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Fuel className="h-4 w-4" />
            <span>{getFuelTypeLabel(vehicle.fuelType || FuelType.PETROL)}</span>
          </div>
          
          {vehicle.currentMileage && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings className="h-4 w-4" />
              <span>{vehicle.currentMileage.toLocaleString()} km</span>
            </div>
          )}

          {vehicle.plateNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {vehicle.plateNumber}
              </span>
            </div>
          )}

          {(vehicle.locationLat && vehicle.locationLng) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Géolocalisation disponible</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(vehicle)}
              className="flex-1"
            >
              Détails
            </Button>
          )}
          
          {onReserve && (
            <Button 
              size="sm" 
              onClick={() => onReserve(vehicle)}
              disabled={!isAvailable}
              className="flex-1"
            >
              {isAvailable ? 'Réserver' : 'Indisponible'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 