import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Incident } from '@/app/types/Incident';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateIncident = async (
  id: string,
  data: Partial<Incident>,
  access_token?: string
): Promise<Incident> => {
  const url = new URL(`/incidents/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update incident');
  }

  return response.json();
};

export const useUpdateIncident = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Incident> }) =>
      updateIncident(id, data, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};
