import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Payment } from '@/app/types/Payment';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updatePayment = async (
  id: string,
  data: Partial<Payment>,
  access_token?: string
): Promise<Payment> => {
  const url = new URL(`/payments/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update payment');
  }

  return response.json();
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) =>
      updatePayment(id, data, access_token as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};
