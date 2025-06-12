import { Vehicle } from '@/app/types/Vehicle';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

const updateVehicle = async (
  id: string,
  data: Partial<Vehicle>,
  access_token?: string
): Promise<Vehicle> => {
  const url = new URL(`/vehicles/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update vehicle');
  }

  return response.json();
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
