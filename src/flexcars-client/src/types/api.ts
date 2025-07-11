export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VehicleQueryParams extends QueryParams {
  companyId?: string;
  status?: string;
  fuelType?: string;
  brand?: string;
  model?: string;
  locationLat?: number;
  locationLng?: number;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  availableFrom?: string;
  availableTo?: string;
}

export interface ReservationQueryParams extends QueryParams {
  vehicleId?: string;
  customerId?: string;
  status?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserQueryParams extends QueryParams {
  role?: string;
  companyId?: string;
  emailConfirmed?: boolean;
}

export interface DocumentQueryParams extends QueryParams {
  userId?: string;
  type?: string;
  verified?: boolean;
}

export interface IncidentQueryParams extends QueryParams {
  vehicleId?: string;
  reportedById?: string;
  severity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationQueryParams extends QueryParams {
  userId?: string;
  type?: string;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
} 