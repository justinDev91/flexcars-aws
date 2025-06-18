import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { PricingRule } from '@/app/types/PricingRule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const PRICING_RULES_KEY = 'pricing-rules';
const PRICING_RULE_KEY = 'pricing-rule';


const fetchAllPricingRules = async (access_token?: string): Promise<PricingRule[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing-rules`, {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch pricing rules');
  return response.json();
};

export const useGetAllPricingRules = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [PRICING_RULES_KEY],
    queryFn: () => fetchAllPricingRules(access_token),
    enabled: !!isAuthenticated,
    refetchOnWindowFocus: false,
  });

  return {
    pricingRules: query.data || [],
    isPricingRulesLoading: query.isLoading,
    ...query,
  };
};

const fetchPricingRuleById = async (id: string, access_token?: string): Promise<PricingRule> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing-rules/${id}`, {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch pricing rule');
  return response.json();
};

export const useGetPricingRuleById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [PRICING_RULE_KEY, id],
    queryFn: () => fetchPricingRuleById(id, access_token),
    enabled: !!id && !!isAuthenticated,
    refetchOnWindowFocus: false,
  });

  return {
    pricingRule: query.data,
    isPricingRuleLoading: query.isLoading,
    ...query,
  };
};


const createPricingRule = async (data: Omit<PricingRule, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing-rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create pricing rule');
  return response.json();
};

export const useCreatePricingRule = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: Omit<PricingRule, 'id'>) => createPricingRule(data, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICING_RULES_KEY] });
    },
  });
};


const updatePricingRule = async (
  id: string,
  data: Partial<PricingRule>,
  access_token?: string
): Promise<PricingRule> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing-rules/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update pricing rule');
  return response.json();
};

export const useUpdatePricingRule = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingRule> }) =>
      updatePricingRule(id, data, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICING_RULES_KEY] });
    },
  });
};


const deletePricingRule = async (id: string, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing-rules/${id}`, {
    method: 'DELETE',
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) throw new Error('Failed to delete pricing rule');
  return response.json();
};

export const useDeletePricingRule = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (id: string) => deletePricingRule(id, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICING_RULES_KEY] });
    },
  });
};


interface CalculateTotalPriceDto {
  vehicleId: string;
  startDate: string;
  endDate: string;
}

const calculateTotalPrice = async (
  data: CalculateTotalPriceDto,
  access_token?: string
): Promise<number> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing-rules/calculate-price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to calculate total price');
  return response.json();
};

export const useCalculateTotalPrice = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: CalculateTotalPriceDto) => calculateTotalPrice(data, access_token),
  });
};
