import { z } from 'zod';
import { InvoiceStatus } from '../types/Invoice';


export const invoiceSchema = z.object({
  id: z.string(),
  reservationId: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  paidAt: z.string(),
  status: z.nativeEnum(InvoiceStatus),
  penaltyAmount: z.number().optional(),
});

export const invoiceInitialValues = {
  id: '',
  reservationId: '',
  invoiceNumber: '',
  amount: 0,
  dueDate: '',
  paidAt: '',
  status: InvoiceStatus.UNPAID,
  penaltyAmount: undefined,
};

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
