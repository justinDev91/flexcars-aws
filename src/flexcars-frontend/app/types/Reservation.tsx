export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Reservation {
  id: string;
  vehicleId: string;
  customerId: string;
  startDatetime?: string; // ISO 8601 format
  endDatetime?: string;   // ISO 8601 format
  pickupLocation?: string;
  dropoffLocation?: string;
  status?: ReservationStatus;
  totalPrice?: number;
}
