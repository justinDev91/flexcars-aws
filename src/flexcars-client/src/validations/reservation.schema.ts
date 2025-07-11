import { z } from "zod";
import { Location, ReservationStatus } from "../types/reservation";

export const createReservationSchema = z.object({
  vehicleId: z.string().min(1, "Le véhicule est requis"),
  customerId: z.string().min(1, "Le client est requis"),
  startDatetime: z.string().min(1, "La date de début est requise"),
  endDatetime: z.string().min(1, "La date de fin est requise"),
  pickupLocation: z.nativeEnum(Location).default(Location.SAINT_DENIS),
  dropoffLocation: z.nativeEnum(Location).default(Location.ISSY_LES_MOULINEAUX),
  carSittingOption: z.boolean().default(false),
});

export const updateReservationSchema = z.object({
  startDatetime: z.string().min(1, "La date de début est requise").optional(),
  endDatetime: z.string().min(1, "La date de fin est requise").optional(),
  pickupLocation: z.nativeEnum(Location).optional(),
  dropoffLocation: z.nativeEnum(Location).optional(),
  carSittingOption: z.boolean().optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
  totalPrice: z.number().min(0, "Le prix doit être positif").optional(),
});

export type CreateReservationFormValues = z.infer<typeof createReservationSchema>;
export type UpdateReservationFormValues = z.infer<typeof updateReservationSchema>;

export const createReservationInitialValues: CreateReservationFormValues = {
  vehicleId: "",
  customerId: "",
  startDatetime: "",
  endDatetime: "",
  pickupLocation: Location.SAINT_DENIS,
  dropoffLocation: Location.ISSY_LES_MOULINEAUX,
  carSittingOption: false,
};

export const updateReservationInitialValues: UpdateReservationFormValues = {
  startDatetime: "",
  endDatetime: "",
  pickupLocation: Location.SAINT_DENIS,
  dropoffLocation: Location.ISSY_LES_MOULINEAUX,
  carSittingOption: false,
  status: ReservationStatus.PENDING,
  totalPrice: 0,
}; 