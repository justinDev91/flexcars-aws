import { ApiError, ApiResponse } from '../types/api';
import { Vehicle, CreateVehicleData, UpdateVehicleData } from '../types/vehicle';
import { 
  Reservation, 
  ReservationFilters, 
  CreateReservationRequest, 
  UpdateReservationRequest,
  AvailabilityCheckRequest,
  AvailabilityCheckResponse,
  ReservationStats
} from '../types/reservation';
import { Payment } from '../types/payment';
import { Document } from '../types/document';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        const error: ApiError = {
          message: errorData.message || 'Une erreur est survenue',
          statusCode: response.status,
          error: errorData.error,
        };
        throw error;
      }

      const data = await response.json();
      return {
        data,
        statusCode: response.status,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          statusCode: 500,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params as Record<string, string>).toString()}` : endpoint;
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post<{access_token: string, user: unknown}>('/auth/login', { email, password });
  },

  register: async (email: string, password: string, firstName: string, lastName: string) => {
    return apiClient.post<{message: string}>('/auth/register', { email, password, firstName, lastName });
  },

  confirmEmail: async (token: string) => {
    return apiClient.get<{message: string}>('/auth/confirm-email', { token });
  },

  forgotPassword: async (email: string) => {
    return apiClient.post<{message: string}>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return apiClient.post<{message: string}>(`/auth/reset-password?token=${token}`, { password });
  },

  // Google OAuth
  googleAuth: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
};

// Vehicle endpoints
export const vehicleApi = {
  getVehicles: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return apiClient.get<Vehicle[]>(`/vehicles?${searchParams.toString()}`);
  },

  getVehicle: async (id: string) => {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  },

  createVehicle: async (data: CreateVehicleData) => {
    return apiClient.post<Vehicle>('/vehicles', data as unknown as Record<string, unknown>);
  },

  updateVehicle: async (id: string, data: UpdateVehicleData) => {
    return apiClient.put<Vehicle>(`/vehicles/${id}`, data as unknown as Record<string, unknown>);
  },

  deleteVehicle: async (id: string) => {
    return apiClient.delete(`/vehicles/${id}`);
  },

  // Nouvelles routes pour le dropoff
  dropoffNormal: async (data: {
    reservationId: string;
    currentMileage: number;
    dropoffTime: string;
    hasAccident: boolean;
    currentLocationLat: number;
    currentLocationLng: number;
  }) => {
    return apiClient.post('/vehicles/dropoff/normal', data);
  },

  dropoffWithCarSitter: async (data: {
    reservationId: string;
    currentMileage: number;
    dropoffTime: string;
    hasAccident: boolean;
    carSitterId: string;
    currentLocationLat: number;
    currentLocationLng: number;
    signature?: string;
  }) => {
    return apiClient.post('/vehicles/dropoff/with-carsitter', data);
  },

  calculatePenalty: async (data: { reservationId: string; hasAccident: boolean }) => {
    return apiClient.post('/vehicles/dropoff/calculate-penalty', data);
  },

  pickup: async (id: string) => {
    return apiClient.get(`/vehicles/${id}/pickup`);
  },
};

// Reservation endpoints
export const reservationApi = {
  getReservations: async (params: { page?: number; limit?: number } & ReservationFilters) => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.vehicleId) searchParams.append('vehicleId', params.vehicleId);
    if (params.customerId) searchParams.append('customerId', params.customerId);
    if (params.startDate) searchParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) searchParams.append('endDate', params.endDate.toISOString());
    if (params.location) searchParams.append('location', params.location);

    return apiClient.get<Reservation[]>(`/reservations?${searchParams.toString()}`);
  },

  getReservation: async (id: string) => {
    return apiClient.get<Reservation>(`/reservations/${id}`);
  },

  getReservationsByCustomer: async (customerId: string) => {
    return apiClient.get<Reservation[]>(`/reservations/customer/${customerId}`);
  },

  createReservation: async (data: CreateReservationRequest) => {
    // Convertir les dates en strings pour l'API
    const requestData = {
      ...data,
      startDatetime: data.startDatetime.toISOString(),
      endDatetime: data.endDatetime.toISOString(),
    };
    return apiClient.post<Reservation>('/reservations', requestData);
  },

  updateReservation: async (id: string, data: UpdateReservationRequest) => {
    // Convertir les dates en strings pour l'API
    const requestData = {
      ...data,
      startDatetime: data.startDatetime ? data.startDatetime.toISOString() : undefined,
      endDatetime: data.endDatetime ? data.endDatetime.toISOString() : undefined,
    };
    return apiClient.put<Reservation>(`/reservations/${id}`, requestData);
  },

  deleteReservation: async (id: string) => {
    return apiClient.delete(`/reservations/${id}`);
  },

  // Vérifier la disponibilité d'un véhicule
  checkAvailability: async (data: AvailabilityCheckRequest): Promise<AvailabilityCheckResponse> => {
    const requestData = {
      vehicleId: data.vehicleId,
      startDatetime: data.startDatetime.toISOString(),
      endDatetime: data.endDatetime.toISOString(),
      excludeReservationId: data.excludeReservationId,
    };
    
    const response = await apiClient.post<AvailabilityCheckResponse>('/reservations/check-availability', requestData);
    return response.data;
  },

  // Obtenir les statistiques de réservation
  getReservationStats: async (): Promise<ReservationStats> => {
    const response = await apiClient.get<ReservationStats>('/reservations/stats');
    return response.data;
  },

  // Scanner une réservation (utilisé pour la récupération/retour)
  scanReservation: async (identifier: string) => {
    return apiClient.get<{ reservation: Reservation; vehicle: Vehicle }>(`/reservations/scan/${identifier}`);
  },

  // Déposer un véhicule
  dropVehicle: async (data: { firstName: string; reservationId: string; currentMileage: number }) => {
    return apiClient.post('/reservations/vehicle-drop', data);
  },
};

// Payment endpoints
export const paymentApi = {
  createPaymentIntent: async (invoiceId: string) => {
    return apiClient.post<{
      clientSecret: string | null;
      paymentIntentId: string | null;
      amount: number;
      error?: string;
    }>('/payments/create-payment-intent', { invoiceId });
  },

  confirmPayment: async (paymentIntentId: string) => {
    return apiClient.post<{
      success: boolean;
      message: string;
      paymentId?: string;
      invoiceId?: string;
      paymentIntentId: string;
      error?: string;
      status?: string;
    }>('/payments/confirm-payment', { paymentIntentId });
  },

  getPayments: async () => {
    return apiClient.get<Payment[]>('/payments');
  },

  createPayment: async (data: { invoiceId: string; transactionId?: string; status?: string }) => {
    const apiResponse = await apiClient.post<Payment>('/payments', data);
    console.log("💳 Payment created :", apiResponse);
    return apiClient.post<Payment>('/payments', data);
  },

  createRefund: async (data: { invoiceId: string; reason?: string; amount?: number }) => {
    return apiClient.post<{
      refundId: string;
      amount: number;
      status: string;
      message: string;
    }>('/payments/refund-by-invoice', data);
  },
};

// Document endpoints
export const documentApi = {
  getDocuments: async (userId?: string) => {
    if (userId) {
      return apiClient.get<Document[]>(`/documents/user/${userId}`);
    }
    return apiClient.get<Document[]>('/documents');
  },

  getDocument: async (id: string) => {
    return apiClient.get<Document>(`/documents/${id}`);
  },

  createDocument: async (data: {
    userId: string;
    type: string;
    fileUrl: string;
  }) => {
    return apiClient.post<Document>('/documents', data);
  },

  updateDocument: async (id: string, data: {
    type?: string;
    fileUrl?: string;
    verified?: boolean;
  }) => {
    return apiClient.put<Document>(`/documents/${id}`, data);
  },

  deleteDocument: async (id: string) => {
    return apiClient.delete(`/documents/${id}`);
  },

  uploadDocument: async (file: File, documentType: string, userId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);
    formData.append('userId', userId);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur lors de l\'upload' }));
      throw new Error(errorData.message || 'Erreur lors de l\'upload du fichier');
    }

    return response.json();
  },
};

// GDPR endpoints
export const gdprApi = {
  exportUserData: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/data-export`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export des données');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `user-data-export-${userId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getUserConsents: async (userId: string) => {
    return apiClient.get(`/users/${userId}/consents`);
  },

  anonymizeUserData: async (userId: string) => {
    return apiClient.post(`/users/${userId}/anonymize`, {});
  },
};

export default apiClient; 

// Notification endpoints
export const notificationApi = {
  getNotifications: async (userId?: string) => {
    const params = userId ? { userId } : undefined;
    return apiClient.get<{
      id: string;
      title: string;
      message: string;
      type: 'RESERVATION' | 'PAYMENT' | 'MAINTENANCE' | 'PROMOTION' | 'SYSTEM';
      isRead: boolean;
      createdAt: string;
      userId: string;
    }[]>('/notifications', params);
  },

  getNotification: async (id: string) => {
    return apiClient.get<{
      id: string;
      title: string;
      message: string;
      type: string;
      isRead: boolean;
      createdAt: string;
      userId: string;
    }>(`/notifications/${id}`);
  },

  markAsRead: async (id: string) => {
    return apiClient.put(`/notifications/${id}`, { isRead: true });
  },

  markAsUnread: async (id: string) => {
    return apiClient.put(`/notifications/${id}`, { isRead: false });
  },

  deleteNotification: async (id: string) => {
    return apiClient.delete(`/notifications/${id}`);
  },

  createNotification: async (data: {
    title: string;
    message: string;
    type: string;
    userId: string;
  }) => {
    return apiClient.post('/notifications', data);
  },
};

// Invoice endpoints
export const invoiceApi = {
  getInvoices: async (params?: { userId?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient.get<{
      id: string;
      invoiceNumber: string;
      amount: number;
      tax: number;
      total: number;
      status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'REFUNDED';
      issuedAt: string;
      dueDate: string;
      paidAt?: string;
      customerId: string;
      customer?: {
        firstName: string;
        lastName: string;
        email: string;
      };
      reservationId?: string;
      reservation?: {
        id: string;
        vehicle: {
          brand: string;
          model: string;
          plateNumber: string;
        };
      };
    }[]>(`/invoices?${searchParams.toString()}`);
  },

  getInvoice: async (id: string) => {
    return apiClient.get<{
      id: string;
      invoiceNumber: string;
      amount: number;
      tax: number;
      total: number;
      status: string;
      issuedAt: string;
      dueDate: string;
      paidAt?: string;
      customerId: string;
      customer?: {
        firstName: string;
        lastName: string;
        email: string;
      };
      reservationId?: string;
    }>(`/invoices/${id}`);
  },

  createInvoice: async (data: {
    amount: number;
    tax?: number;
    customerId: string;
    reservationId?: string;
    dueDate?: string;
  }) => {
    return apiClient.post('/invoices', data);
  },

  updateInvoice: async (id: string, data: {
    amount?: number;
    tax?: number;
    status?: string;
    paidAt?: string;
  }) => {
    return apiClient.put(`/invoices/${id}`, data);
  },

  deleteInvoice: async (id: string) => {
    return apiClient.delete(`/invoices/${id}`);
  },

  downloadInvoice: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement de la facture');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `facture-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  viewInvoice: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/view`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'affichage de la facture');
    }

    const html = await response.text();
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  },
};

// User endpoints
export const userApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);

    return apiClient.get<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      birthDate?: string;
      avatar?: string;
      emailConfirmed: boolean;
      createdAt: string;
      updatedAt: string;
    }[]>(`/users?${searchParams.toString()}`);
  },

  getUser: async (id: string) => {
    return apiClient.get<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      birthDate?: string;
      avatar?: string;
      emailConfirmed: boolean;
      createdAt: string;
      updatedAt: string;
    }>(`/users/${id}`);
  },

  updateUser: async (id: string, data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    birthDate?: string;
    avatar?: string;
  }) => {
    return apiClient.put(`/users/${id}`, data);
  },

  updatePassword: async (data: { token: string; password: string }) => {
    return apiClient.put('/users/password', data);
  },

  deleteUser: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },
};

// Pricing Rule endpoints
export const pricingRuleApi = {
  getPricingRules: async () => {
    return apiClient.get<{
      id: string;
      name: string;
      type: 'RENTAL' | 'ACCIDENT' | 'LATER_PENALTY';
      durationType: 'HOURLY' | 'DAILY' | 'WEEKLY';
      basePrice: number;
      createdAt: string;
      updatedAt: string;
    }[]>('/pricing-rules');
  },

  getPricingRule: async (id: string) => {
    return apiClient.get(`/pricing-rules/${id}`);
  },

  calculatePrice: async (data: {
    vehicleId: string;
    startDate: string;
    endDate: string;
  }) => {
    return apiClient.post<{
      totalPrice: number;
      breakdown: {
        basePrice: number;
        duration: number;
        durationType: string;
        additionalFees?: number;
      };
    }>('/pricing-rules/calculate-price', data);
  },
};

// Incident endpoints
export const incidentApi = {
  getIncidents: async (params?: { vehicleId?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.vehicleId) searchParams.append('vehicleId', params.vehicleId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient.get<{
      id: string;
      title: string;
      description: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      status: 'OPEN' | 'RESOLVED' | 'IN_REVIEW';
      vehicleId: string;
      reportedById: string;
      createdAt: string;
      resolvedAt?: string;
    }[]>(`/incidents?${searchParams.toString()}`);
  },

  getIncident: async (id: string) => {
    return apiClient.get(`/incidents/${id}`);
  },

  createIncident: async (data: {
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    vehicleId: string;
    reportedById: string;
  }) => {
    return apiClient.post('/incidents', data);
  },

  updateIncident: async (id: string, data: {
    title?: string;
    description?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'OPEN' | 'RESOLVED' | 'IN_REVIEW';
    resolvedAt?: string;
  }) => {
    return apiClient.put(`/incidents/${id}`, data);
  },

  deleteIncident: async (id: string) => {
    return apiClient.delete(`/incidents/${id}`);
  },
};

// Rental Contract endpoints
export const rentalContractApi = {
  getContracts: async (params?: { customerId?: string; reservationId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.reservationId) searchParams.append('reservationId', params.reservationId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient.get<{
      id: string;
      contractNumber: string;
      terms: string;
      signedAt?: string;
      customerId: string;
      reservationId: string;
      createdAt: string;
      customer?: {
        firstName: string;
        lastName: string;
        email: string;
      };
      reservation?: {
        vehicle: {
          brand: string;
          model: string;
          plateNumber: string;
        };
      };
    }[]>(`/rental-contracts?${searchParams.toString()}`);
  },

  getContract: async (id: string) => {
    return apiClient.get(`/rental-contracts/${id}`);
  },

  createContract: async (data: {
    terms: string;
    customerId: string;
    reservationId: string;
  }) => {
    return apiClient.post('/rental-contracts', data);
  },

  signContract: async (id: string, signature: string) => {
    return apiClient.put(`/rental-contracts/${id}`, {
      signedAt: new Date().toISOString(),
      signature: signature,
    });
  },

  deleteContract: async (id: string) => {
    return apiClient.delete(`/rental-contracts/${id}`);
  },
};

// Car Sitter endpoints pour le nouveau workflow
export const carSitterApi = {
  getAllAvailable: async () => {
    return apiClient.get('/car-sitters/available');
  },

  getAvailableCarSitters: async (lat: number, lng: number, radius?: number) => {
    const searchParams = new URLSearchParams();
    searchParams.append('lat', lat.toString());
    searchParams.append('lng', lng.toString());
    if (radius) searchParams.append('radius', radius.toString());

    return apiClient.get(`/car-sitters/available-near?${searchParams.toString()}`);
  },

  getDropoffRequest: async (id: string) => {
    return apiClient.get(`/car-sitters/dropoff-request/${id}`);
  },

  validateDropoff: async (data: {
    dropoffRequestId: string;
    isValidated: boolean;
    notes?: string;
  }) => {
    return apiClient.post('/car-sitters/validate-dropoff', data);
  },
}; 