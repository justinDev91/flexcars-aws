import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { CarSitter } from '@/app/types/CarSitters';
import { useQuery } from '@tanstack/react-query';

const CAR_SITTERS_KEY = 'carSitters';

const fetchAllCarSitters = async (access_token?: string): Promise<CarSitter[]> => {
  const url = new URL('/car-sitters', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch car sitters');
  }

  return response.json();
};

export const useGetAllCarSitters = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [CAR_SITTERS_KEY],
    queryFn: () => fetchAllCarSitters(access_token),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated,
  });

  return {
    carSitters: query.data || [],
    isCarSittersLoading: query.isLoading,
    ...query,
  };
};
