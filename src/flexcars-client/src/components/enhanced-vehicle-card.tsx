import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Car, 
  Fuel, 
  MapPin, 
  Eye, 
  Gauge,
  Zap,
  Droplets,
  Battery,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  UserCheck,
  ArrowRight
} from "lucide-react";
import { Vehicle, FuelType, VehicleStatus } from "@/types/vehicle";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface EnhancedVehicleCardProps {
  vehicle: Vehicle;
  onReserve?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
  variant?: 'card' | 'list';
}

const getFuelTypeInfo = (fuelType: FuelType): { label: string; icon: typeof Fuel; color: string; bgColor: string } => {
  switch (fuelType) {
    case FuelType.PETROL:
      return { label: 'Essence', icon: Fuel, color: 'text-orange-700', bgColor: 'bg-orange-50' };
    case FuelType.DIESEL:
      return { label: 'Diesel', icon: Droplets, color: 'text-blue-700', bgColor: 'bg-blue-50' };
    case FuelType.ELECTRIC:
      return { label: 'Électrique', icon: Battery, color: 'text-green-700', bgColor: 'bg-green-50' };
    case FuelType.HYBRID:
      return { label: 'Hybride', icon: Zap, color: 'text-purple-700', bgColor: 'bg-purple-50' };
    default:
      return { label: 'Non spécifié', icon: Fuel, color: 'text-gray-700', bgColor: 'bg-gray-50' };
  }
};

const getStatusInfo = (status: VehicleStatus): { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: typeof CheckCircle;
  action: string;
  actionColor: string;
} => {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return { 
        label: 'Disponible', 
        color: 'text-green-700', 
        bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
        icon: CheckCircle,
        action: 'Réserver',
        actionColor: 'bg-green-600 hover:bg-green-700'
      };
    case VehicleStatus.RESERVED:
      return { 
        label: 'Réservé', 
        color: 'text-yellow-700', 
        bgColor: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
        icon: Clock,
        action: 'Voir réservation',
        actionColor: 'bg-yellow-600 hover:bg-yellow-700'
      };
    case VehicleStatus.RENTED:
      return { 
        label: 'Loué', 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        icon: UserCheck,
        action: 'Voir contrat',
        actionColor: 'bg-blue-600 hover:bg-blue-700'
      };
    case VehicleStatus.MAINTENANCE:
      return { 
        label: 'Maintenance', 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        icon: Settings,
        action: 'Voir maintenance',
        actionColor: 'bg-orange-600 hover:bg-orange-700'
      };
    case VehicleStatus.INCIDENT:
      return { 
        label: 'Incident', 
        color: 'text-red-700', 
        bgColor: 'bg-red-50 border-red-200 hover:bg-red-100',
        icon: AlertTriangle,
        action: 'Voir incident',
        actionColor: 'bg-red-600 hover:bg-red-700'
      };
    default:
      return { 
        label: 'Statut inconnu', 
        color: 'text-gray-700', 
        bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
        icon: Clock,
        action: 'Voir détails',
        actionColor: 'bg-gray-600 hover:bg-gray-700'
      };
  }
};

const getConditionLevel = (mileage: number): { label: string; color: string; bgColor: string } => {
  if (mileage < 30000) return { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-50' };
  if (mileage < 60000) return { label: 'Très bon', color: 'text-blue-700', bgColor: 'bg-blue-50' };
  if (mileage < 100000) return { label: 'Bon', color: 'text-yellow-700', bgColor: 'bg-yellow-50' };
  if (mileage < 150000) return { label: 'Correct', color: 'text-orange-700', bgColor: 'bg-orange-50' };
  return { label: 'Usé', color: 'text-red-700', bgColor: 'bg-red-50' };
};

export function EnhancedVehicleCard({ 
  vehicle, 
  onReserve, 
  onViewDetails, 
  variant = 'card'
}: EnhancedVehicleCardProps) {
  const isAvailable = vehicle.status === VehicleStatus.AVAILABLE;
  const fuelInfo = getFuelTypeInfo(vehicle.fuelType || FuelType.PETROL);
  const statusInfo = getStatusInfo(vehicle.status || VehicleStatus.AVAILABLE);
  const conditionInfo = getConditionLevel(vehicle.currentMileage || 0);
  const FuelIcon = fuelInfo.icon;
  const StatusIcon = statusInfo.icon;

  if (variant === 'list') {
    return (
      <Card className="w-full hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:scale-[1.01] group">
        <CardContent className="p-6">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Image améliorée */}
            <div className="col-span-1">
              <div className="w-20 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                {vehicle.imageUrl ? (
                  <Image 
                    src={vehicle.imageUrl} 
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="80px"
                  />
                ) : (
                  <Car className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </div>

            {/* Info principale */}
            <div className="col-span-3">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">{vehicle.year || 'N/A'}</span>
                  {vehicle.plateNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border">
                        {vehicle.plateNumber}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="col-span-2">
              <Badge className={cn(
                "border transition-all duration-200 font-medium px-3 py-1.5 justify-center",
                statusInfo.bgColor,
                statusInfo.color
              )}>
                <StatusIcon className="h-3 w-3 mr-1.5" />
                {statusInfo.label}
              </Badge>
            </div>

            {/* Carburant */}
            <div className="col-span-2">
              <div className={cn(
                "flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                fuelInfo.bgColor
              )}>
                <FuelIcon className={cn("h-4 w-4", fuelInfo.color)} />
                <span className={cn("font-medium text-sm", fuelInfo.color)}>{fuelInfo.label}</span>
              </div>
            </div>

            {/* Kilométrage */}
            <div className="col-span-2">
              {vehicle.currentMileage ? (
                <div className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                  <Gauge className="h-4 w-4 text-gray-600" />
                  <div className="text-center">
                    <div className="font-medium text-sm text-gray-700">
                      {vehicle.currentMileage.toLocaleString()} km
                    </div>
                    <div className={cn("text-xs", conditionInfo.color)}>
                      {conditionInfo.label}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center px-3 py-2 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-500">N/A</span>
                </div>
              )}
            </div>

            {/* GPS */}
            <div className="col-span-1">
              {vehicle.gpsEnabled && (
                <div className="flex items-center justify-center px-2 py-2 rounded-lg bg-blue-50">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-1">
              <div className="flex items-center justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails?.(vehicle)}
                  className="hover:bg-gray-50 transition-colors px-3"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => onReserve?.(vehicle)}
                  disabled={!isAvailable}
                  className={cn(
                    "transition-all duration-200 px-3",
                    isAvailable 
                      ? statusInfo.actionColor 
                      : "bg-gray-300 cursor-not-allowed hover:bg-gray-300"
                  )}
                >
                  {isAvailable ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:scale-[1.02] group bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
              {vehicle.brand} {vehicle.model}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{vehicle.year || 'Année non spécifiée'}</span>
              {vehicle.plateNumber && (
                <>
                  <span>•</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border">
                    {vehicle.plateNumber}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={cn(
              "border transition-all duration-200 font-medium px-3 py-1.5",
              statusInfo.bgColor,
              statusInfo.color
            )}>
              <StatusIcon className="h-3 w-3 mr-1.5" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Image améliorée */}
        <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
          {vehicle.imageUrl ? (
            <Image 
              src={vehicle.imageUrl} 
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Car className="h-12 w-12 text-gray-400" />
          )}
        </div>

        {/* Specs avec meilleur design */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              "flex items-center space-x-2 p-3 rounded-lg transition-colors",
              fuelInfo.bgColor
            )}>
              <FuelIcon className={cn("h-5 w-5", fuelInfo.color)} />
              <span className={cn("font-medium text-sm", fuelInfo.color)}>{fuelInfo.label}</span>
            </div>
            
            {vehicle.currentMileage && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-50">
                <Gauge className="h-5 w-5 text-gray-600" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-gray-700">
                    {vehicle.currentMileage.toLocaleString()} km
                  </span>
                  <span className={cn("text-xs", conditionInfo.color)}>
                    {conditionInfo.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Features additionnelles */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {vehicle.gpsEnabled && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700">GPS</span>
                </div>
              )}
            </div>
            
            {!isAvailable && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Non disponible</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Actions améliorées */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails?.(vehicle)}
            className="flex-1 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Détails
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => onReserve?.(vehicle)}
            disabled={!isAvailable}
            className={cn(
              "flex-1 transition-all duration-200 group/button",
              isAvailable 
                ? statusInfo.actionColor 
                : "bg-gray-300 cursor-not-allowed hover:bg-gray-300"
            )}
          >
            {isAvailable ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {statusInfo.action}
                <ArrowRight className="h-4 w-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Indisponible
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 