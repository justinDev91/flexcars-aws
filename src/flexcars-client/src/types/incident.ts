export enum IncidentSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum IncidentStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
  IN_REVIEW = "IN_REVIEW",
}

export interface Incident {
  id: string;
  vehicleId: string;
  reportedById: string;
  description?: string;
  reservationId?: string;
  location?: string;
  severity?: IncidentSeverity;
  photosUrl?: string;
  status: IncidentStatus;
  reportedAt: string;
  resolvedAt?: string;
}

export interface CreateIncidentDto {
  vehicleId: string;
  reportedById: string;
  description?: string;
  reservationId?: string;
  location?: string;
  severity?: IncidentSeverity;
  photosUrl?: string;
}

export interface UpdateIncidentDto {
  description?: string;
  location?: string;
  severity?: IncidentSeverity;
  photosUrl?: string;
  status?: IncidentStatus;
  resolvedAt?: string;
}

export interface IncidentWithDetails extends Incident {
  vehicle: {
    id: string;
    brand?: string;
    model?: string;
    plateNumber?: string;
    imageUrl?: string;
  };
  reportedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reservation?: {
    id: string;
    startDatetime?: string;
    endDatetime?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
  };
} 