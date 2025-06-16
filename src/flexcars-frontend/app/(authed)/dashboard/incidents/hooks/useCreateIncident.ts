import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Incident } from '@/app/types/Incident';
import { useMutation } from '@tanstack/react-query';

const createIncident = async (Data: Omit<Incident, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(Data),
  });

  if (!response.ok) {
    throw new Error('Failed to create incident');
  }

  return response.json();
};

export const useCreateIncident = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (Data: Omit<Incident, 'id'>) =>
      createIncident(Data , access_token),
  });
};
