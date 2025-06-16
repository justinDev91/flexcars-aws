import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Invoice } from '@/app/types/Invoice';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateInvoice = async (
  id: string,
  data: Partial<Invoice>,
  access_token?: string
): Promise<Invoice> => {
  const url = new URL(`/invoices/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update invoice');
  }

  return response.json();
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      updateInvoice(id, data, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
