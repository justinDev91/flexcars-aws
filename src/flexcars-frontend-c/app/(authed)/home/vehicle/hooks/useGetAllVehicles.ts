import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { useQuery } from '@tanstack/react-query';

const VEHICLES_KEY = 'vehicles';

const fetchAllVehicles = async (access_token?: string): Promise<any[]> => {
  const url = new URL('/vehicles', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  return response.json();
};

export const useGetAllVehicles = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [VEHICLES_KEY],
    queryFn: () => fetchAllVehicles(access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated,
  });

  return {
    vehicles: query.data || [],
    isVehiclesLoading: query.isLoading,
    ...query,
  };
};
