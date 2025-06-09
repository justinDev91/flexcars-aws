import { z } from 'zod';
import { ReservationStatus } from '../types/Reservation';

export const createReservationSchema = z.object({
  vehicleId: z.string(),
  customerId: z.string(),
  startDatetime: z.string().datetime().optional().default('2025-06-09T10:58:54.631683'),
  endDatetime: z.string().datetime().optional().default('2025-06-29T10:58:54.631704'),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
  totalPrice: z.number().optional(),
});

export type CreateReservationFormValues = z.infer<typeof createReservationSchema>;

export const createReservationInitialValues: CreateReservationFormValues = {
  vehicleId: '',
  customerId: '',
  startDatetime: '2025-06-09T10:58:54.631717',
  endDatetime: '2025-06-29T10:58:54.631725',
  pickupLocation: '',
  dropoffLocation: '',
  status: ReservationStatus.PENDING,
  totalPrice: undefined,
};
