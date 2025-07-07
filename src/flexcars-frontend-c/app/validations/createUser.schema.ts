import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string(),
  birthDate: z.string(),
  avatar: z.string().optional(),
  companyId: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const createUserInitialValues: CreateUserFormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  birthDate: '',
  avatar: '',
  companyId: '',
};
