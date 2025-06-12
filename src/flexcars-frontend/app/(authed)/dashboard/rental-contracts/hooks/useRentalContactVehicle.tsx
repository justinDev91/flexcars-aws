import { RentalContract } from '@/app/types/RentalContract';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateRentalContract = async (
  id: string,
  data: Partial<RentalContract>,
  access_token?: string
): Promise<RentalContract> => {
  const url = new URL(`/rental-contracts/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update rental contract');
  }

  return response.json();
};

export const useUpdateRentalContract = () => {
  const queryClient = useQueryClient();
  const access_token = window.localStorage.getItem("token");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RentalContract> }) =>
      updateRentalContract(id, data, access_token as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-contracts'] });
    },
  });
};
