import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Incident } from '@/app/types/Incident';
import { useQuery } from '@tanstack/react-query';

const INCIDENT_KEY = 'incidents';

const fetchIncidentById = async (
  id: string,
  access_token?: string
): Promise<Incident> => {
  const url = new URL(`/incidents/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch incident');
  }

  return response.json();
};

export const useGetIncidentById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [INCIDENT_KEY, id],
    queryFn: () => fetchIncidentById(id, access_token),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated && !!id,
  });

  return {
    incident: query.data,
    isIncidentLoading: query.isLoading,
    ...query,
  };
};
