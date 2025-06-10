
export enum Availability {
  AVAILABLE = "AVAILABLE",
  BUSY = "BUSY"
}

export interface CarSitter {
  id: string;
  userId: string;
  assignedVehicleId?: string;
  currentLocationLat?: number;
  currentLocationLng?: number;
  availability: Availability;
  lastActiveAt?: Date;
}
