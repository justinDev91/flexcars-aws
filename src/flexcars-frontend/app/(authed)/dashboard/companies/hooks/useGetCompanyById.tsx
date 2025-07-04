import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Company } from '@/app/types/company';
import { useQuery } from '@tanstack/react-query';

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
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [COMPANY_KEY, id],
    queryFn: () => fetchCompanyById(id, access_token),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated && !!id,
  });

  return {
    company: query.data,
    isCompanyLoading: query.isLoading,
    ...query,
  };
};
