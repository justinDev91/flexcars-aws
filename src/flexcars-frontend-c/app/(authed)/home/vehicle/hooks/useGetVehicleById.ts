import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { useQuery } from '@tanstack/react-query';

const VEHICLE_KEY = 'vehicle';

const fetchVehicleById = async (id: string, access_token?: string): Promise<any> => {
  const url = new URL(`/vehicles/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vehicle');
  }

  return response.json();
};

export const useGetVehicleById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [VEHICLE_KEY, id],
    queryFn: () => fetchVehicleById(id, access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated && !!id,
  });

  return {
    vehicle: query.data || null,
    isVehicleLoading: query.isLoading,
    ...query,
  };
};
