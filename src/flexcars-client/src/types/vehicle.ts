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
  companyId: string;
  brand?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  fuelType?: FuelType;
  currentMileage?: number;
  gpsEnabled?: boolean;
  status?: VehicleStatus;
  locationLat?: number;
  locationLng?: number;
  imageUrl?: string;
  createdAt: Date;
}

export interface VehicleFilters {
  brand?: string;
  fuelType?: FuelType;
  status?: VehicleStatus;
  minYear?: number;
  maxYear?: number;
  search?: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVehicleData {
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

export interface UpdateVehicleData {
  brand?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  fuelType?: FuelType;
  currentMileage?: number;
  gpsEnabled?: boolean;
  status?: VehicleStatus;
  locationLat?: number;
  locationLng?: number;
  imageUrl?: string;
}

export interface VehicleWithDetails extends Vehicle {
  company: {
    id: string;
    name: string;
    type: string;
  };
  pricingRules?: {
    id: string;
    durationType: string;
    basePrice: number;
    dynamicMultiplier?: number;
  }[];
} 