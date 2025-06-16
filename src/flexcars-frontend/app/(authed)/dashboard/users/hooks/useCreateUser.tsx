import { useMutation } from '@tanstack/react-query';
import { User } from './useFindUsers';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';


export interface CreateUser extends User {
  password: string; 
}

const createUser = async (userData: CreateUser, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
};

export const useCreateUser = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (userData: CreateUser) => createUser(userData , access_token),
  });
};
