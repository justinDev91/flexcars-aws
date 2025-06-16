import { z } from 'zod';

export enum AlertType {
  UPCOMING = 'UPCOMING',
  OVERDUE = 'OVERDUE',
  MILEAGE = 'MILEAGE',
}

export const createMaintenanceAlertSchema = z.object({
  vehicleId: z.string(),
  mileageTrigger: z.number(),
  recurring: z.boolean().optional(),
  maintenanceId: z.string().optional(),
  alertDate: z.string(), // ISO format
  alertType: z.nativeEnum(AlertType),
  message: z.string(),
  resolved: z.boolean().optional(),
});

export type CreateMaintenanceAlertFormValues = z.infer<typeof createMaintenanceAlertSchema>;

export const createMaintenanceAlertInitialValues: CreateMaintenanceAlertFormValues = {
  vehicleId: '',
  mileageTrigger: 0,
  recurring: false,
  maintenanceId: undefined,
  alertDate: new Date().toISOString(),
  alertType: AlertType.UPCOMING,
  message: '',
  resolved: false,
};
