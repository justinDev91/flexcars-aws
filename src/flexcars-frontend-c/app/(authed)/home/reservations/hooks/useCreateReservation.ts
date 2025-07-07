import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Reservation } from '@/app/types/Reservation';
import { useMutation } from '@tanstack/react-query';

const createReservation = async (Data: Omit<Reservation, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(Data),
  });

  if (!response.ok) {
    throw new Error('Failed to create reservation');
  }

  return response.json();
};

export const useCreateReservation = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (Data: Omit<Reservation, 'id'>) =>
      createReservation(Data , access_token as string ),
  });
};
