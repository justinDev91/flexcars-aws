import { Incident } from '@/app/types/Incident';
import { useQuery } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

const INCIDENTS_KEY = 'incidents';

const fetchAllIncidents = async (access_token?: string): Promise<Incident[]> => {
  const url = new URL('/incidents', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }

  return response.json();
};

export const useGetAllIncidents = () => {
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [INCIDENTS_KEY],
    queryFn: () => fetchAllIncidents(),
    refetchOnWindowFocus: false,
    // enabled: !!access_token,
  });

  return {
    incidents: query.data || [],
    isIncidentsLoading: query.isLoading,
    ...query,
  };
};
