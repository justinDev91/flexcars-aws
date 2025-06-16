import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Invoice } from '@/app/types/Invoice';
import { useQuery } from '@tanstack/react-query';

const INVOICES_KEY = 'invoices';

const fetchInvoiceById = async (
  id: string,
  access_token?: string
): Promise<Invoice> => {
  const url = new URL(`/invoices/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoice');
  }

  return response.json();
};

export const useGetInvoiceById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [INVOICES_KEY, id],
    queryFn: () => fetchInvoiceById(id, access_token),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated && !!id,
  });

  return {
    invoice: query.data,
    isInvoiceLoading: query.isLoading,
    ...query,
  };
};
