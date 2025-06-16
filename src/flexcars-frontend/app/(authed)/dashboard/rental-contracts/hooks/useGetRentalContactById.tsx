import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { RentalContract } from '@/app/types/RentalContract';
import { useQuery } from '@tanstack/react-query';

const RENTAL_CONTRACT_KEY = 'rental-contract';

const fetchRentalContractById = async (
  id: string,
  access_token?: string
): Promise<RentalContract> => {
  const url = new URL(`/rental-contracts/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rental contract');
  }

  return response.json();
};

export const useGetRentalContractById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [RENTAL_CONTRACT_KEY, id],
    queryFn: () => fetchRentalContractById(id, access_token as string),
    enabled: !!id && !!isAuthenticated,
    refetchOnWindowFocus: false,
  });

  return {
    rentalContract: query.data,
    isRentalContractLoading: query.isLoading,
    ...query,
  };
};
