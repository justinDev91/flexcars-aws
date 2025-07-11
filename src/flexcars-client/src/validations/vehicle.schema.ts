import { z } from "zod";
import { FuelType, VehicleStatus } from "../types/vehicle";

export const createVehicleSchema = z.object({
  companyId: z.string().min(1, "L'entreprise est requise"),
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  year: z.number().min(1900, "Année invalide").max(new Date().getFullYear() + 1, "Année invalide"),
  plateNumber: z.string().min(1, "Le numéro de plaque est requis"),
  fuelType: z.nativeEnum(FuelType),
  currentMileage: z.number().min(0, "Le kilométrage doit être positif"),
  gpsEnabled: z.boolean().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  imageUrl: z.string().url("URL invalide").optional(),
});

export const updateVehicleSchema = z.object({
  brand: z.string().min(1, "La marque est requise").optional(),
  model: z.string().min(1, "Le modèle est requis").optional(),
  year: z.number().min(1900, "Année invalide").max(new Date().getFullYear() + 1, "Année invalide").optional(),
  plateNumber: z.string().min(1, "Le numéro de plaque est requis").optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  currentMileage: z.number().min(0, "Le kilométrage doit être positif").optional(),
  gpsEnabled: z.boolean().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  imageUrl: z.string().url("URL invalide").optional(),
});

export type CreateVehicleFormValues = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleFormValues = z.infer<typeof updateVehicleSchema>;

export const createVehicleInitialValues: CreateVehicleFormValues = {
  companyId: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  plateNumber: "",
  fuelType: FuelType.PETROL,
  currentMileage: 0,
  gpsEnabled: false,
  status: VehicleStatus.AVAILABLE,
  locationLat: undefined,
  locationLng: undefined,
  imageUrl: "",
}; 