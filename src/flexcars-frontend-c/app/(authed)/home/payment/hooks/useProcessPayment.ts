import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

interface PaymentInput {
  invoiceId: string;
  amount: number;
  method: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER';
  transactionId?: string;
}

interface PaymentResponse {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId: string;
  message: string;
}

const processPayment = async (
  data: PaymentInput,
  access_token?: string
): Promise<PaymentResponse> => {
  const url = new URL('/payments', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Payment failed');
  }

  return response.json();
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: PaymentInput) => processPayment(data, access_token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      if (data.status === 'SUCCESS') {
        notifications.show({
          title: 'Payment Successful',
          message: 'Your payment has been processed successfully.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Payment Processing',
          message: 'Your payment is being processed. You will receive an update soon.',
          color: 'blue',
        });
      }
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Payment Failed',
        message: error.message || 'Failed to process payment. Please try again.',
        color: 'red',
      });
    },
  });
};
