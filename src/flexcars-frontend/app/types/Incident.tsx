export enum IncidentSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export enum IncidentStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
  IN_REVIEW = "IN_REVIEW"
}


export interface Incident {
  id: string,
  vehicleId: string;
  reportedById: string;
  description?: string;
  reservationId?: string;
  location?: string;
  severity?: IncidentSeverity;
  photosUrl?: string;
  status?: IncidentStatus;
  reportedAt?: string; // ISO 8601 string
  resolvedAt?: string; // ISO 8601 string
}
