import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Company } from '@/app/types/company';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateCompany = async (
  id: string,
  data: Partial<Company>,
  access_token?: string
): Promise<Company> => {
  const url = new URL(`/companies/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update company');
  }

  return response.json();
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      updateCompany(id, data, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
