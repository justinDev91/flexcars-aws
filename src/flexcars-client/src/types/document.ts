export enum DocumentType {
  ID_CARD = "ID_CARD",
  DRIVER_LICENSE = "DRIVER_LICENSE",
}

export interface Document {
  id: string;
  userId: string;
  type?: DocumentType;
  fileUrl?: string;
  verified: boolean;
  uploadedAt: string;
}

export interface CreateDocumentDto {
  userId: string;
  type: DocumentType;
  fileUrl: string;
}

export interface UpdateDocumentDto {
  type?: DocumentType;
  fileUrl?: string;
  verified?: boolean;
}

export interface DocumentWithUser extends Document {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
} 