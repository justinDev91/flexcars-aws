import { Invoice } from '@/app/types/Invoice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

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
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
