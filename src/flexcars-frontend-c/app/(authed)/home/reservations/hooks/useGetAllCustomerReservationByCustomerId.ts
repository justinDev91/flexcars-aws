import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Reservation } from '@/app/types/Reservation';
import { useQuery } from '@tanstack/react-query';

const CUSTOMER_RESERVATIONS_KEY = 'customer-reservations';

const fetchCustomerReservations = async (customerId: string, access_token?: string): Promise<Reservation[]> => {
  if (!customerId) return [];
  const url = new URL(`/reservations/customer/${customerId}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customer reservations');
  }

  return response.json();
};

export const useGetAllCustomerReservationByCustomerId = () => {
  const { access_token, isAuthenticated, user } = useAuthSession();
  const customerId = user?.id ?? "";

  const query = useQuery({
    queryKey: [CUSTOMER_RESERVATIONS_KEY, customerId],
    queryFn: () => fetchCustomerReservations(customerId, access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated && !!customerId,
  });

  return {
    reservations: query.data || [],
    isReservationsLoading: query.isLoading,
    ...query,
  };
};
