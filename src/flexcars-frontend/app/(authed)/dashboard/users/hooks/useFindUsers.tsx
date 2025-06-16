import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { useQuery } from '@tanstack/react-query';


export interface FindAllUsersDto {
  page: number;
  limit?: number;
}

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  avatar?: string;
  company?: string | null;
  companyId?: string;
}

const USERS_KEY = 'users';

const fetchUsers = async (
  params: FindAllUsersDto,
  access_token?: string
): Promise<User[]> => {
  const url = new URL('/users', process.env.NEXT_PUBLIC_API_URL);
  url.searchParams.set('page', params.page.toString());
  url.searchParams.set('limit', params.limit ? params.limit.toString() : "4");

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

export const useFindAllUsers = (params: FindAllUsersDto) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => fetchUsers(params, access_token),
    enabled: isAuthenticated && !!access_token,
    refetchOnWindowFocus: false,
  });

  return {
    users: query.data || [],
    isUsersLoading: query.isLoading,
    ...query,
  };
};
