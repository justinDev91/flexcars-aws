export enum PaymentMethod {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
}
