"use client";

import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { User } from '@/types/user';
import { useQuery } from '@tanstack/react-query';

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
  const { access_token, isAuthenticated } = useAuthSession();
  
  const query = useQuery({
    queryKey: [USERS_KEY],
    queryFn: () => fetchAllUser(access_token),
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated,
  });

  return {
    users: query.data || [],
    isUsersLoading: query.isLoading,
    ...query,
  };
};
