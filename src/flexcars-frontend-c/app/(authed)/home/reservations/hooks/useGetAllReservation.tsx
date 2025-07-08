import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Reservation } from '@/app/types/Reservation';
import { useQuery } from '@tanstack/react-query';

const RESERVATIONS_KEY = 'reservations';

const fetchAllReservation = async (access_token?: string): Promise<Reservation[]> => {
  const url = new URL('/reservations', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch réservations');
  }

  return response.json();
};

export const useGetAllReservation = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [RESERVATIONS_KEY],
    queryFn: () => fetchAllReservation(access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated,
  });

  return {
    reservations: query.data || [],
    isReservationsLoading: query.isLoading,
    ...query,
  };
};
