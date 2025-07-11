import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  avatar: z.string().optional(),
  companyId: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  firstName: z.string().min(1, "Le prénom est requis").optional(),
  lastName: z.string().min(1, "Le nom est requis").optional(),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  avatar: z.string().optional(),
  companyId: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const createUserInitialValues: CreateUserFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  birthDate: "",
  avatar: "",
  companyId: "",
};

export const updateUserInitialValues: UpdateUserFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  birthDate: "",
  avatar: "",
  companyId: "",
}; 