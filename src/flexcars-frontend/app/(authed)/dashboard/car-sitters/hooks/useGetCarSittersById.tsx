import { CarSitter } from '@/app/types/CarSitters';
import { useQuery } from '@tanstack/react-query';

const CAR_SITTER_KEY = 'carSitter';

const fetchCarSitterById = async (id: string, access_token?: string): Promise<CarSitter> => {
  const url = new URL(`/car-sitters/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch car sitter');
  }

  return response.json();
};

export const useGetCarSitterById = (id: string) => {
  const access_token = window.localStorage.getItem("token");

  const query = useQuery({
    queryKey: [CAR_SITTER_KEY, id],
    queryFn: () => fetchCarSitterById(id, access_token as string),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  return {
    carSitter: query.data,
    isCarSitterLoading: query.isLoading,
    ...query,
  };
};
