import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

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

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre")
    .regex(/[\W_]/, "Doit contenir un caractère spécial"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const signInInitialValues: SignInFormValues = {
  email: "",
  password: "",
};

export const registerInitialValues: RegisterFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};

export const forgotPasswordInitialValues: ForgotPasswordFormValues = {
  email: "",
};

export const resetPasswordInitialValues: ResetPasswordFormValues = {
  password: "",
}; 