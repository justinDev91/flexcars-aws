import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Vehicle } from '@/app/types/Vehicle';
import { useMutation } from '@tanstack/react-query';

const createVehicle = async (companyData: Omit<Vehicle, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    throw new Error('Failed to create vehicle');
  }

  return response.json();
};

export const useCreateVehicle = () => {
  const { access_token } = useAuthSession();
  return useMutation({
    mutationFn: (vehicleData: Omit<Vehicle, 'id'>) =>
      createVehicle(vehicleData , access_token),
  });
};
