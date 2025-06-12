import { Incident } from '@/app/types/Incident';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

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
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Incident> }) =>
      updateIncident(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};
