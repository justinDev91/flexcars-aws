import { Document } from '@/app/types/Document';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateDocument = async (
  id: string,
  data: Partial<Document>,
  access_token?: string
): Promise<Document> => {
  const url = new URL(`/documents/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update document');
  }

  return response.json();
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const access_token = window.localStorage.getItem("token");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) =>
      updateDocument(id, data, access_token as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
