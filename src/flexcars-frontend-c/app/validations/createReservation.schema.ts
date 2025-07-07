import { z } from 'zod';
import { ReservationStatus, Location } from '../types/Reservation';

export const createReservationSchema = z.object({
  vehicleId: z.string(),
  customerId: z.string(),
  startDatetime: z.string(),
  endDatetime: z.string(),
  pickupLocation: z.nativeEnum(Location).default(Location.SAINT_DENIS),
  dropoffLocation: z.nativeEnum(Location).default(Location.ISSY_LES_MOULINEAUX),
  status: z.nativeEnum(ReservationStatus).optional(),
  totalPrice: z.number().optional(),
  carSittingOption: z.boolean().default(false),
});

export type CreateReservationFormValues = z.infer<typeof createReservationSchema>;

export const createReservationInitialValues: CreateReservationFormValues = {
  vehicleId: '',
  customerId: '',
  startDatetime: '2025-06-09T10:58:54.631717',
  endDatetime: '2025-06-29T10:58:54.631725',
  pickupLocation: Location.SAINT_DENIS,
  dropoffLocation: Location.ISSY_LES_MOULINEAUX,
  status: ReservationStatus.PENDING,
  totalPrice: undefined,
  carSittingOption: false,
};
