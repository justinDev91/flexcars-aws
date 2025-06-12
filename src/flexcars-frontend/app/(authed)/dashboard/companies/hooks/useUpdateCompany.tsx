import { Company } from '@/app/types/company';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSession } from "next-auth/react"

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
  // const { data: session } = useSession();
  // const access_token = session?.access_token;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
