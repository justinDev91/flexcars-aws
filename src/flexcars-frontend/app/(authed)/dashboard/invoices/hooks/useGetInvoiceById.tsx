import { Invoice } from '@/app/types/Invoice';
import { useQuery } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

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
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [INVOICES_KEY, id],
    queryFn: () => fetchInvoiceById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    // enabled: !!access_token && !!id,
  });

  return {
    invoice: query.data,
    isInvoiceLoading: query.isLoading,
    ...query,
  };
};
