import { Reservation } from '@/app/types/Reservation';
import { useQuery } from '@tanstack/react-query';

const RESERVATION_KEY = 'vehicles';

const fetchReservationById = async (
  id: string,
  access_token?: string
): Promise<Reservation> => {
  const url = new URL(`/reservations/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reservation');
  }

  return response.json();
};

export const useGetReservationById = (id: string) => {
  const access_token = window.localStorage.getItem("token");

  const query = useQuery({
    queryKey: [RESERVATION_KEY, id],
    queryFn: () => fetchReservationById(id, access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!access_token && !!id,
  });

  return {
    reservation: query.data,
    isReservationLoading: query.isLoading,
    ...query,
  };
};
