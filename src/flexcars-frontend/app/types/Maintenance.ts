export enum MaintenanceType {
    OIL_CHANGE = 'OIL_CHANGE',
    INSPECTION = 'INSPECTION',
    REPAIR = 'REPAIR',
  }
  
  export enum MaintenanceStatus {
    PENDING = 'PENDING',
    DONE = 'DONE',
    OVERDUE = 'OVERDUE',
  }
  
  export interface IMaintenance {
    id: string
    vehicleId: string;
    type?: MaintenanceType;
    scheduledDate?: string; // ISO format
    completedDate?: string; // ISO format
    status?: MaintenanceStatus;
    notes?: string;
  }
  