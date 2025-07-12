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

// Types pour les réponses de dropoff avec pénalités
export interface DropoffResponse {
  needsPayment: boolean;
  penaltyAmount?: number;
  penaltyInvoiceId?: string;
  message: string;
}

export interface DropoffWithPenaltyResponse extends DropoffResponse {
  needsPayment: true;
  penaltyAmount: number;
  penaltyInvoiceId: string;
}

export interface DropoffSuccessResponse extends DropoffResponse {
  needsPayment: false;
}

export interface PenaltyCalculationResponse {
  penaltyAmount: number;
  penaltyInvoiceId: string | null;
  message: string;
} 