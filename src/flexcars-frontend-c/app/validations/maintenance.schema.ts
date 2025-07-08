import { z } from 'zod';

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

export const createMaintenanceSchema = z.object({
  vehicleId: z.string(),
  type: z.nativeEnum(MaintenanceType).optional(),
  scheduledDate: z.string().optional(), // ISO string
  completedDate: z.string().optional(), // ISO string
  status: z.nativeEnum(MaintenanceStatus).optional(),
  notes: z.string().optional(),
});

export type CreateMaintenanceFormValues = z.infer<typeof createMaintenanceSchema>;

export const createMaintenanceInitialValues: CreateMaintenanceFormValues = {
  vehicleId: '',
  type: MaintenanceType.INSPECTION,
  scheduledDate: new Date().toISOString(),
  completedDate: undefined,
  status: MaintenanceStatus.PENDING,
  notes: '',
};
