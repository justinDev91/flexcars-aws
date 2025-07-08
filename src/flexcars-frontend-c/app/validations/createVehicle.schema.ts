
import { z } from 'zod';
import { FuelType, VehicleStatus } from '../types/Vehicle';

export const createVehicleSchema = z.object({
  companyId: z.string().optional(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  plateNumber: z.string(),
  fuelType: z.nativeEnum(FuelType),
  currentMileage: z.number(),
  gpsEnabled: z.boolean().optional(),
  status: z.nativeEnum(VehicleStatus),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  imageUrl: z.string().optional(),
});

export type CreateVehicleFormValues = z.infer<typeof createVehicleSchema>;

export const createVehicleInitialValues: CreateVehicleFormValues = {
  companyId: '',
  brand: '',
  model: '',
  year: 2020,
  plateNumber: '',
  fuelType: FuelType.PETROL,
  currentMileage: 0,
  gpsEnabled: false,
  status: VehicleStatus.AVAILABLE,
  locationLat: undefined,
  locationLng: undefined,
  imageUrl: '',
};
