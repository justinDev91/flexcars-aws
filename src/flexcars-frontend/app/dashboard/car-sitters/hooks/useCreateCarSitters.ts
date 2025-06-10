import { CarSitter } from '@/app/types/CarSitters';
import { useMutation } from '@tanstack/react-query';

const createCarSitter = async (data: Omit<CarSitter, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/car-sitters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create car sitter');
  }

  return response.json();
};

export const useCreateCarSitter = () => {
  return useMutation({
    mutationFn: (data: Omit<CarSitter, 'id'>) => createCarSitter(data),
  });
};
