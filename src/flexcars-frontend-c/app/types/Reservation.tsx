import { Invoice } from "./Invoice";

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum Location {
  PARIS_11 = 'PARIS_11',
  PARIS_19 = 'PARIS_19',
  ISSY_LES_MOULINEAUX = 'ISSY_LES_MOULINEAUX',
  BOULOGNE = 'BOULOGNE',
  SAINT_DENIS = 'SAINT_DENIS',
}

export interface Reservation {
  id: string;
  vehicleId: string;
  customerId: string;
  startDatetime?: string; // ISO 8601 format
  endDatetime?: string;   // ISO 8601 format
  pickupLocation?: Location;
  invoice?: Invoice
  dropoffLocation?: Location;
  status?: ReservationStatus;
  totalPrice?: number;
  carSittingOption?: boolean;
}
