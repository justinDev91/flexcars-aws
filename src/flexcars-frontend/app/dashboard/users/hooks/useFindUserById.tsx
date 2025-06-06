import { useQuery } from '@tanstack/react-query';
import { User } from './useFindUsers';
// import { useSession } from "next-auth/react"

export const USER_KEY = 'user';

const fetchUserById = async (
  id: string | null,
  access_token?: string
): Promise<User> => {
  const url = new URL(`/users/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
};

export const useFindUserById = (id: string | null) => {
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [USER_KEY, id],
    queryFn: () => fetchUserById(id),
    enabled: !!id, // Only run if ID is provided
    refetchOnWindowFocus: false,
    // enabled: !!access_token && !!id,
  });

  return {
    user: query.data,
    isUserLoading: query.isLoading,
    ...query,
  };
};
