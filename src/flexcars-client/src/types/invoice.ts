export enum InvoiceStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  OVERDUE = "OVERDUE",
}

export interface Invoice {
  id: string;
  reservationId: string;
  invoiceNumber?: string;
  amount?: number;
  dueDate: string;
  paidAt?: string;
  status: InvoiceStatus;
  penaltyAmount?: number;
}

export interface CreateInvoiceDto {
  reservationId: string;
  invoiceNumber?: string;
  amount?: number;
  dueDate: string;
  status?: InvoiceStatus;
  penaltyAmount?: number;
}

export interface UpdateInvoiceDto {
  invoiceNumber?: string;
  amount?: number;
  dueDate?: string;
  paidAt?: string;
  status?: InvoiceStatus;
  penaltyAmount?: number;
}

export interface InvoiceWithDetails extends Invoice {
  reservation: {
    id: string;
    startDatetime?: string;
    endDatetime?: string;
    totalPrice?: number;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    vehicle: {
      id: string;
      brand?: string;
      model?: string;
      plateNumber?: string;
    };
  };
  payments?: {
    id: string;
    method: string;
    transactionId?: string;
    paidAt: string;
    status: string;
  }[];
} 