import { z } from 'zod';
import { Availability } from '../types/CarSitters';

export const createCarSitterSchema = z.object({
  id: z.string(),
  userId: z.string(),
  assignedVehicleId: z.string(),
  currentLocationLat: z.number(),
  currentLocationLng: z.number(),
  availability: z.nativeEnum(Availability).default(Availability.BUSY),
  lastActiveAt: z.coerce.date().optional(),
});

export const createCarSitterInitialValues = {
  id: '',
  userId: '',
  assignedVehicleId: '',
  currentLocationLat: 0,
  currentLocationLng: 0,
  availability: Availability.BUSY,
  lastActiveAt: new Date(),
};

export type CreateCarSitterFormValues = z.infer<typeof createCarSitterSchema>;
