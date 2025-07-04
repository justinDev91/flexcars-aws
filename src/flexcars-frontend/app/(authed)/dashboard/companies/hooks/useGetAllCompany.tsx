import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Company } from '@/app/types/company';
import { useQuery } from '@tanstack/react-query';

const COMPANIES_KEY = 'companies';

const fetchAllCompanies = async (access_token?: string): Promise<Company[]> => {
  const url = new URL('/companies', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }

  return response.json();
};

export const useGetAllCompany = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [COMPANIES_KEY],
    queryFn: () => fetchAllCompanies(access_token),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated,
  });

  return {
    companies: query.data || [],
    isCompaniesLoading: query.isLoading,
    ...query,
  };
};
