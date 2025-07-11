import { z } from "zod";
import { DocumentType } from "../types/document";

export const createDocumentSchema = z.object({
  userId: z.string().min(1, "L'utilisateur est requis"),
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Le type de document est requis" }),
  }),
  fileUrl: z.string().url("URL invalide"),
});

export const updateDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Le type de document est requis" }),
  }).optional(),
  fileUrl: z.string().url("URL invalide").optional(),
  verified: z.boolean().optional(),
});

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentFormValues = z.infer<typeof updateDocumentSchema>;

export const createDocumentInitialValues: CreateDocumentFormValues = {
  userId: "",
  type: DocumentType.ID_CARD,
  fileUrl: "",
};

export const updateDocumentInitialValues: UpdateDocumentFormValues = {
  type: DocumentType.ID_CARD,
  fileUrl: "",
  verified: false,
}; 