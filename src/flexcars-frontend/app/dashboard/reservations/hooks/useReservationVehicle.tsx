import { Reservation } from '@/app/types/Reservation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

const updateReservation = async (
  id: string,
  data: Partial<Reservation>,
  access_token?: string
): Promise<Reservation> => {
  const url = new URL(`/reservations/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update reservation');
  }

  return response.json();
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reservation> }) =>
      updateReservation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};
