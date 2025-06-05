
import { useQuery } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

export interface FindAllUsersDto {
  page: number;
  limit?: number;
}

export interface User {
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
  url.searchParams.set('limit',  params.limit ? params.limit.toString(): "4");

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
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  const query = useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => fetchUsers(params),
    refetchOnWindowFocus: false,
    // enabled: !!access_token,
  });
  return {
    users: query.data || [],
    isUsersLoading: query.isLoading,
    ...query,
  };
};
