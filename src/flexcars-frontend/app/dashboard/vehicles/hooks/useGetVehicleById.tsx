import { Vehicle } from '@/app/types/Vehicle';
import { useQuery } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

const VEHICLE_KEY = 'vehicles';

const fetchVehicleById = async (
  id: string,
  access_token?: string
): Promise<Vehicle> => {
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
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [VEHICLE_KEY, id],
    queryFn: () => fetchVehicleById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    // enabled: !!access_token && !!id,
  });

  return {
    vehicle: query.data,
    isVehicleLoading: query.isLoading,
    ...query,
  };
};
