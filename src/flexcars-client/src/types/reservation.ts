// Import des types existants
import { Vehicle } from './vehicle';
import { User } from './user';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKUP_REQUESTED = 'PICKUP_REQUESTED',
  PICKED_UP = 'PICKED_UP',
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

export enum InvoiceStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OVERDUE = 'OVERDUE',
}

export interface Reservation {
  id: string;
  vehicleId: string;
  customerId: string;
  startDatetime: Date;
  endDatetime: Date;
  pickupLocation: Location;
  dropoffLocation: Location;
  carSittingOption: boolean;
  status: ReservationStatus;
  totalPrice?: number;
  createdAt: Date;
  // Relations
  vehicle?: Vehicle;
  customer?: User;
  invoices?: Invoice[];
  services?: ReservationService[];
}

export interface Invoice {
  id: string;
  reservationId?: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  paidAt?: Date;
  status: InvoiceStatus;
  penaltyAmount?: number;
  invoiceType?: string;
}

export interface ReservationService {
  id: string;
  reservationId: string;
  serviceId: string;
  // Relations
  service?: RentalService;
}

export interface RentalService {
  id: string;
  name: string;
  pricePerDay: number;
}

// Types pour le formulaire de réservation
export interface CreateReservationRequest {
  vehicleId: string;
  customerId: string;
  startDatetime: Date;
  endDatetime: Date;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  carSittingOption?: boolean;
  serviceIds?: string[];
}

export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
  status?: ReservationStatus;
}

// Types pour les réponses API
export interface ReservationResponse {
  success: boolean;
  data?: Reservation;
  message?: string;
}

export interface ReservationsResponse {
  success: boolean;
  data?: Reservation[];
  message?: string;
}



// Types pour la validation des créneaux
export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  conflictingReservations?: Reservation[];
}

export interface AvailabilityCheckRequest {
  vehicleId: string;
  startDatetime: Date;
  endDatetime: Date;
  excludeReservationId?: string; // Pour exclure lors de la modification
}

export interface AvailabilityCheckResponse {
  isAvailable: boolean;
  conflicts?: Reservation[];
  message?: string;
}

// Types pour les filtres et recherche
export interface ReservationFilters {
  status?: ReservationStatus;
  vehicleId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  location?: Location;
}

export interface ReservationStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  totalRevenue: number;
}

// ======= PICKUP TYPES =======

export enum PickupStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
}

export interface PickupRequest {
  id: string;
  reservationId: string;
  carSitterId?: string;
  requestedTime: Date;
  pickupLocation: Location;
  status: PickupStatus;
  carSitterNotes?: string;
  validatedAt?: Date;
  createdAt: Date;
  // Relations
  reservation?: Reservation;
  carSitter?: {
    id: string;
    user: User;
  };
}

export interface PickupFormData {
  reservationId: string;
  requestedTime: Date;
  pickupLocation: Location;
  carSitterId?: string;
}

export interface PickupResponse {
  success: boolean;
  data?: PickupRequest;
  message?: string;
  pickupRequestId?: string;
}

export interface DocumentCheck {
  hasDriverLicense: boolean;
  hasIdCard: boolean;
  canPickup: boolean;
}

export interface PickupAvailabilityCheck {
  canPickup: boolean;
  message: string;
  minutesUntilPickup?: number;
}

// Types pour les réponses de validation
export interface ValidationResponse {
  message: string;
  status: PickupStatus;
  reservationUpdated?: boolean;
} 