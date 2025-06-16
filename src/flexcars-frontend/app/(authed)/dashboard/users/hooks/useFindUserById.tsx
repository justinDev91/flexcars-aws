import { useQuery } from '@tanstack/react-query';
import { User } from './useFindUsers';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';

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
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [USER_KEY, id],
    queryFn: () => fetchUserById(id, access_token as string),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated && !!id,
  });

  return {
    user: query.data,
    isUserLoading: query.isLoading,
    ...query,
  };
};
