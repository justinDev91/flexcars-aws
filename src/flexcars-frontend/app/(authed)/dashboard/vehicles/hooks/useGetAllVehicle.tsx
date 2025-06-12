import { Vehicle } from '@/app/types/Vehicle';
import { useQuery } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

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
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [VEHICLES_KEY],
    queryFn: () => fetchAllVehicle(),
    refetchOnWindowFocus: false,
    // enabled: !!access_token,
  });

  return {
    vehicles: query.data || [],
    isVehiclesLoading: query.isLoading,
    ...query,
  };
};
