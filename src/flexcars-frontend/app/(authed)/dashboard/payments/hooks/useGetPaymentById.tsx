import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Payment } from '@/app/types/Payment';
import { useQuery } from '@tanstack/react-query';

const PAYMENT_KEY = 'payment';

const fetchPaymentById = async (
  id: string,
  access_token?: string
): Promise<Payment> => {
  const url = new URL(`/payments/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payment');
  }

  return response.json();
};

export const useGetPaymentById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [PAYMENT_KEY, id],
    queryFn: () => fetchPaymentById(id, access_token as string),
    enabled: !!id && !!isAuthenticated,
    refetchOnWindowFocus: false,
  });

  return {
    payment: query.data,
    isPaymentLoading: query.isLoading,
    ...query,
  };
};
