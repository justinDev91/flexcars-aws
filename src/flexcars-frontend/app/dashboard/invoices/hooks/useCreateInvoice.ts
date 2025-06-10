import { Invoice } from '@/app/types/Invoice';
import { useMutation } from '@tanstack/react-query';

const createInvoice = async (Data: Omit<Invoice, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(Data),
  });

  if (!response.ok) {
    throw new Error('Failed to create invoice');
  }

  return response.json();
};

export const useCreateInvoice = () => {
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  return useMutation({
    mutationFn: (Data: Omit<Invoice, 'id'>) =>
      createInvoice(Data /*, access_token */),
  });
};
