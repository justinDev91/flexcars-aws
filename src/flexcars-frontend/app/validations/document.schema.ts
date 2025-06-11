import { z } from "zod";
import { DocumentType } from "../types/Document";

export const createDocumentSchema = z.object({
  userId: z.string().min(1, "User is required"),
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Document type is required" }),
  }),
  fileUrl: z.string().url("Invalid URL"),
  verified: z.boolean().default(false),
  uploadedAt: z.string(),
});

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;

export const createDocumentInitialValues: CreateDocumentFormValues = {
  userId: "",
  type: DocumentType.DRIVER_LICENSE,
  fileUrl: "",
  verified: false,
  uploadedAt: new Date().toISOString(),
};
