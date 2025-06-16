import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Invoice } from '@/app/types/Invoice';
import { useQuery } from '@tanstack/react-query';

const INVOICES_KEY = 'invoices';

const fetchAllInvoices = async (access_token?: string): Promise<Invoice[]> => {
  const url = new URL('/invoices', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
};

export const useGetAllInvoice = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [INVOICES_KEY],
    queryFn: () => fetchAllInvoices(access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated,
  });

  return {
    invoice: query.data || [],
    isInvoicesLoading: query.isLoading,
    ...query,
  };
};
