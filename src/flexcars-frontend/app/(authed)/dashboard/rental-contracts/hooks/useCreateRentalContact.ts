import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { RentalContract } from '@/app/types/RentalContract';
import { useMutation } from '@tanstack/react-query';

const createRentalContract = async (
  data: Omit<RentalContract, 'id'>,
  access_token?: string
) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rental-contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create rental contract');
  }

  return response.json();
};

export const useCreateRentalContract = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: Omit<RentalContract, 'id'>) =>
      createRentalContract(data, access_token as string),
  });
};
