import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Payment } from '@/app/types/Payment';
import { useQuery } from '@tanstack/react-query';

const PAYMENTS_KEY = 'payments';

const fetchAllPayments = async (
  access_token?: string
): Promise<Payment[]> => {
  const url = new URL('/payments', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }

  return response.json();
};

export const useGetAllPayments = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [PAYMENTS_KEY],
    queryFn: () => fetchAllPayments(access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated
  });

  return {
    payments: query.data || [],
    isPaymentsLoading: query.isLoading,
    ...query,
  };
};
