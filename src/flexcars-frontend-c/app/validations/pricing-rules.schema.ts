import { z } from 'zod';
import { DurationType } from '../types/PricingRule';

export const createPricingRuleSchema = z.object({
  vehicleId: z.string(),
  durationType: z.nativeEnum(DurationType).default(DurationType.HOURLY),
  basePrice: z.number().min(0, 'Base price must be a positive number'),
  dynamicMultiplier: z.number().min(0).optional(),
  season: z.string().optional(),
});

export type CreatePricingRuleFormValues = z.infer<typeof createPricingRuleSchema>;

export const createPricingRuleInitialValues: CreatePricingRuleFormValues = {
  vehicleId: '',
  durationType: DurationType.HOURLY,
  basePrice: 0,
  dynamicMultiplier: 1,
  season: '',
};
