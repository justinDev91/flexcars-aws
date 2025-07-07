import { useMutation } from '@tanstack/react-query';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';

interface DropVehicleInput {
  firstName: string;
  reservationId: string;
  currentMileage: number;
}

interface DropVehicleResponse {
  message: string;
  penaltyAmount?: number;
  invoiceId?: string
}

const dropVehicle = async (
  data: DropVehicleInput,
  access_token?: string
): Promise<DropVehicleResponse> => {

  const url = new URL('/reservations/vehicle-drop', process.env.NEXT_PUBLIC_API_URL);
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to drop vehicle');
  }

  return response.json();
};

export const useDropVehicle = () => {
  const { access_token } = useAuthSession();

  const mutation = useMutation({
    mutationFn: (data: DropVehicleInput) => dropVehicle(data, access_token),
  });

  return {
    dropVehicle: mutation.mutate,
    dropVehicleAsync: mutation.mutateAsync,
    dropSuccess: mutation.isSuccess,
    dropError: mutation.error,
    ...mutation,
  };
};
