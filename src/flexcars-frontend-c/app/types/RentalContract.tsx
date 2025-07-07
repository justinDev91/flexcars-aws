export interface RentalContract {
  id: string;
  reservationId: string;
  pdfUrl?: string;
  signedByCustomerId: string;
  signedByAgentId: string;
  signedAt: string; // ISO 8601 format
}
