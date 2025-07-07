export enum DocumentType {
  ID_CARD = "ID_CARD",
  DRIVER_LICENSE = "DRIVER_LICENSE",
  PROOF_OF_ADDRESS = "PROOF_OF_ADDRESS",
}

export interface Document {
  id: string;
  userId: string;
  type?: DocumentType;
  fileUrl?: string;
  verified: boolean;
  uploadedAt: string; // ISO 8601 string
}
