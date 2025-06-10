import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@/app/types/Payment';

export const createPaymentSchema = z.object({
  invoiceId: z.string(),
  method: z.nativeEnum(PaymentMethod),
  transactionId: z.string(),
  paidAt: z.string(),
  status: z.nativeEnum(PaymentStatus),
});

export type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;

export const createPaymentInitialValues: CreatePaymentFormValues = {
  invoiceId: '',
  method: PaymentMethod.STRIPE,
  transactionId: '',
  paidAt: new Date().toISOString(),
  status: PaymentStatus.PENDING,
};
