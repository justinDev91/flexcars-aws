import { z } from "zod";
import { IncidentSeverity, IncidentStatus } from "../types/incident";

export const createIncidentSchema = z.object({
  vehicleId: z.string().min(1, "Le véhicule est requis"),
  reportedById: z.string().min(1, "Le rapporteur est requis"),
  description: z.string().min(1, "La description est requise"),
  reservationId: z.string().optional(),
  location: z.string().optional(),
  severity: z.nativeEnum(IncidentSeverity).default(IncidentSeverity.MEDIUM),
  photosUrl: z.string().url("URL invalide").optional(),
});

export const updateIncidentSchema = z.object({
  description: z.string().min(1, "La description est requise").optional(),
  location: z.string().optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  photosUrl: z.string().url("URL invalide").optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  resolvedAt: z.string().optional(),
});

export type CreateIncidentFormValues = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentFormValues = z.infer<typeof updateIncidentSchema>;

export const createIncidentInitialValues: CreateIncidentFormValues = {
  vehicleId: "",
  reportedById: "",
  description: "",
  reservationId: "",
  location: "",
  severity: IncidentSeverity.MEDIUM,
  photosUrl: "",
};

export const updateIncidentInitialValues: UpdateIncidentFormValues = {
  description: "",
  location: "",
  severity: IncidentSeverity.MEDIUM,
  photosUrl: "",
  status: IncidentStatus.OPEN,
  resolvedAt: "",
}; 