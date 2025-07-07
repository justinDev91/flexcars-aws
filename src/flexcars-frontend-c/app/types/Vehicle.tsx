export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  INCIDENT = 'INCIDENT',
}

export interface Vehicle {
  id: string;
  companyId?: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  fuelType: FuelType;
  currentMileage: number;
  gpsEnabled?: boolean;
  status: VehicleStatus;
  locationLat?: number;
  locationLng?: number;
  imageUrl?: string;
}
