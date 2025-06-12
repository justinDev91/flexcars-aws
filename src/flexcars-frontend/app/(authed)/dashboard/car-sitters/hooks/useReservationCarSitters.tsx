import { CarSitter } from '@/app/types/CarSitters';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateCarSitter = async (
  id: string,
  data: Partial<CarSitter>,
  access_token?: string
): Promise<CarSitter> => {
  const url = new URL(`/car-sitters/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update car sitter');
  }

  return response.json();
};

export const useUpdateCarSitter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CarSitter> }) =>
      updateCarSitter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carSitters'] });
    },
  });
};
