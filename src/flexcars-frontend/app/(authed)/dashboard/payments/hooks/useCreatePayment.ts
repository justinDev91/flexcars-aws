import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Payment } from '@/app/types/Payment';
import { useMutation } from '@tanstack/react-query';

const createPayment = async (
  data: Omit<Payment, 'id'>,
  access_token?: string
) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment');
  }

  return response.json();
};

export const useCreatePayment = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: Omit<Payment, 'id'>) => createPayment(data, access_token),
  });
};
