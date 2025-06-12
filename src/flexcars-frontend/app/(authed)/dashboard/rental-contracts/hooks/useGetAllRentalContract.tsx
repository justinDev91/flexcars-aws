import { RentalContract } from '@/app/types/RentalContract';
import { useQuery } from '@tanstack/react-query';

const RENTAL_CONTRACTS_KEY = 'rental-contracts';

const fetchAllRentalContracts = async (
  access_token?: string
): Promise<RentalContract[]> => {
  const url = new URL('/rental-contracts', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rental contracts');
  }

  return response.json();
};

export const useGetAllRentalContracts = () => {
  const access_token = window.localStorage.getItem("token");

  const query = useQuery({
    queryKey: [RENTAL_CONTRACTS_KEY],
    queryFn: () => fetchAllRentalContracts(access_token as string),
    refetchOnWindowFocus: false,
  });

  return {
    rentalContracts: query.data || [],
    isRentalContractsLoading: query.isLoading,
    ...query,
  };
};
