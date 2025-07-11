export enum PaymentMethod {
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  transactionId?: string;
  paidAt: string;
  status?: PaymentStatus;
}

export interface CreatePaymentDto {
  invoiceId: string;
  method: PaymentMethod;
  transactionId?: string;
}

export interface UpdatePaymentDto {
  method?: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
}

export interface PaymentWithDetails extends Payment {
  invoice: {
    id: string;
    invoiceNumber?: string;
    amount?: number;
    dueDate: string;
    reservation: {
      id: string;
      customer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  };
} 