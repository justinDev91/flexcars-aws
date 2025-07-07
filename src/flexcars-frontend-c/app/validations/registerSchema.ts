import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  password: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre")
    .regex(/[\W_]/, "Doit contenir un caractère spécial"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const registerInitialValues: RegisterFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};