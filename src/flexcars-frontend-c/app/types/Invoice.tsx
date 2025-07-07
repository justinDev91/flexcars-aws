
export enum InvoiceStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  OVERDUE = "OVERDUE"
}

export interface Invoice {
  id: string;
  reservationId: string;
  invoiceNumber?: string;
  amount?: number;
  dueDate: string; // ISO 8601 format
  paidAt?: string;// ISO 8601 format
  status: InvoiceStatus;
  penaltyAmount?: number;
}
