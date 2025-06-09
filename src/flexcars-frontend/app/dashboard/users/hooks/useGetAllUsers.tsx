import { User } from '@/types/user';
import { useQuery } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

const USERS_KEY = 'users';

const fetchAllUser = async (access_token?: string): Promise<User[]> => {
  const url = new URL('/users', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

export const useGetAllUser = () => {
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [USERS_KEY],
    queryFn: () => fetchAllUser(),
    refetchOnWindowFocus: false,
    // enabled: !!access_token,
  });

  return {
    users: query.data || [],
    isUsersLoading: query.isLoading,
    ...query,
  };
};
