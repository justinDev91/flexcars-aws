import { z } from 'zod';
import { IncidentSeverity, IncidentStatus } from '../types/Incident';

export const createIncidentSchema = z.object({
  vehicleId: z.string(),
  reportedById: z.string(),
  description: z.string().optional(),
  reservationId: z.string().optional(),
  location: z.string().optional(),
  severity: z.nativeEnum(IncidentSeverity),
  photosUrl: z.string().url().optional(),
  status: z.nativeEnum(IncidentStatus),
  reportedAt: z.string(),
  resolvedAt: z.string().optional(),
});

export type CreateIncidentFormValues = z.infer<typeof createIncidentSchema>;


export const createIncidentInitialValues = {
  vehicleId: '',
  reportedById: '',
  description: '',
  reservationId: '',
  location: '',
  severity: IncidentSeverity.LOW,
  photosUrl: '',
  status: IncidentStatus.OPEN,
  reportedAt: new Date().toISOString(),
  resolvedAt: '',
};

