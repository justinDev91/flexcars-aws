import { Company } from '@/app/types/company';
import { useQuery } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

const COMPANY_KEY = 'company';

const fetchCompanyById = async (
  id: string,
  access_token?: string
): Promise<Company> => {
  const url = new URL(`/companies/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch company');
  }

  return response.json();
};

export const useGetCompanyById = (id: string) => {
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [COMPANY_KEY, id],
    queryFn: () => fetchCompanyById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    // enabled: !!access_token && !!id,
  });

  return {
    company: query.data,
    isCompanyLoading: query.isLoading,
    ...query,
  };
};
