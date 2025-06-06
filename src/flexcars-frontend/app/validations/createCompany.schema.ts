import { z } from 'zod';
import { CompanyType } from '../types/company';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  type: z.nativeEnum(CompanyType, {
    errorMap: () => ({ message: 'Select a valid company type' }),
  }),
  address: z.string().min(1, 'Address is required'),
  vatNumber: z.string().min(1, 'VAT number is required'),
  logoUrl: z.string().url('Must be a valid URL'),
});

export const createCompanyInitialValues = {
  name: '',
  type: CompanyType.BUSINESS,
  address: '',
  vatNumber: '',
  logoUrl: '',
};

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
