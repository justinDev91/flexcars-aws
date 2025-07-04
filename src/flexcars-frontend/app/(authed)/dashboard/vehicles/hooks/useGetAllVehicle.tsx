import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Vehicle } from '@/app/types/Vehicle';
import { useQuery } from '@tanstack/react-query';

const VEHICLES_KEY = 'vehicles';

const fetchAllVehicle = async (access_token?: string): Promise<Vehicle[]> => {
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

export const useGetAllVehicle = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [VEHICLES_KEY],
    queryFn: () => fetchAllVehicle(access_token),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated,
  });

  return {
    vehicles: query.data || [],
    isVehiclesLoading: query.isLoading,
    ...query,
  };
};
