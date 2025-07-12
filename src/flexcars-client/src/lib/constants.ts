import { Location, FuelType, VehicleStatus, ReservationStatus } from '../types';

export const LOCATION_LABELS: Record<Location, string> = {
  [Location.PARIS_11]: 'Paris 11ème',
  [Location.PARIS_19]: 'Paris 19ème',
  [Location.ISSY_LES_MOULINEAUX]: 'Issy-les-Moulineaux',
  [Location.BOULOGNE]: 'Boulogne-Billancourt',
  [Location.SAINT_DENIS]: 'Saint-Denis',
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  [FuelType.PETROL]: 'Essence',
  [FuelType.DIESEL]: 'Diesel',
  [FuelType.ELECTRIC]: 'Électrique',
  [FuelType.HYBRID]: 'Hybride',
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  [VehicleStatus.AVAILABLE]: 'Disponible',
  [VehicleStatus.RESERVED]: 'Réservé',
  [VehicleStatus.RENTED]: 'Loué',
  [VehicleStatus.MAINTENANCE]: 'Maintenance',
  [VehicleStatus.INCIDENT]: 'Incident',
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'En attente',
  [ReservationStatus.CONFIRMED]: 'Confirmée',
  [ReservationStatus.PICKUP_REQUESTED]: 'Pickup demandé',
  [ReservationStatus.PICKED_UP]: 'Véhicule récupéré',
  [ReservationStatus.CANCELLED]: 'Annulée',
  [ReservationStatus.COMPLETED]: 'Terminée',
};

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  [VehicleStatus.AVAILABLE]: 'text-green-600 bg-green-50',
  [VehicleStatus.RESERVED]: 'text-blue-600 bg-blue-50',
  [VehicleStatus.RENTED]: 'text-orange-600 bg-orange-50',
  [VehicleStatus.MAINTENANCE]: 'text-yellow-600 bg-yellow-50',
  [VehicleStatus.INCIDENT]: 'text-red-600 bg-red-50',
};

export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'text-yellow-600 bg-yellow-50',
  [ReservationStatus.CONFIRMED]: 'text-green-600 bg-green-50',
  [ReservationStatus.PICKUP_REQUESTED]: 'text-orange-600 bg-orange-50',
  [ReservationStatus.PICKED_UP]: 'text-blue-600 bg-blue-50',
  [ReservationStatus.CANCELLED]: 'text-red-600 bg-red-50',
  [ReservationStatus.COMPLETED]: 'text-gray-600 bg-gray-50',
};

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CONFIRM_EMAIL: '/auth/confirm-email',
    GOOGLE: '/auth/google',
  },
  USERS: '/users',
  VEHICLES: '/vehicles',
  RESERVATIONS: '/reservations',
  DOCUMENTS: '/documents',
  INCIDENTS: '/incidents',
  NOTIFICATIONS: '/notifications',
  INVOICES: '/invoices',
  PAYMENTS: '/payments',
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CONFIRM_EMAIL: '/auth/confirm-email',
  },
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  RESERVATIONS: '/reservations',
  PROFILE: '/profile',
  DOCUMENTS: '/documents',
  NOTIFICATIONS: '/notifications',
} as const; 