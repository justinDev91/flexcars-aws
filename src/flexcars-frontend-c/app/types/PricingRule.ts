export enum DurationType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export interface PricingRule {
  id: string;
  vehicleId: string;
  durationType: DurationType;
  basePrice: number;
  dynamicMultiplier?: number;
  season?: string;
  createdAt?: string;
  updatedAt?: string;
}
