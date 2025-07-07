import { z } from 'zod';

export const createRentalContractSchema = z.object({
  reservationId: z.string(),
  pdfUrl: z.string().url('Invalid PDF URL').optional(),
  signedByCustomerId: z.string(),
  signedByAgentId: z.string(),
  signedAt: z.string()
});

export type CreateRentalContractFormValues = z.infer<typeof createRentalContractSchema>;

export const createRentalContractInitialValues: CreateRentalContractFormValues = {
  reservationId: '',
  pdfUrl: undefined,
  signedByCustomerId: '',
  signedByAgentId: '',
  signedAt: new Date().toISOString(),
};
