export enum AlertType {
    UPCOMING = 'UPCOMING',
    OVERDUE = 'OVERDUE',
    MILEAGE = 'MILEAGE',
  }
  
  export interface IMaintenanceAlert {
    id: string;
    vehicleId: string;
    mileageTrigger: number;
    recurring?: boolean;
    maintenanceId?: string;
    alertDate: string; // ISO format
    alertType: AlertType;
    message: string;
    resolved?: boolean;
  }
  