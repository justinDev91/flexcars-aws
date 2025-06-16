import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Document } from '@/app/types/Document';
import { useQuery } from '@tanstack/react-query';

const fetchDocumentById = async (
  id: string,
  access_token?: string
): Promise<Document> => {
  const url = new URL(`/documents/${id}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }

  return response.json();
};

export const useGetDocumentById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: ['documents', id],
    queryFn: () => fetchDocumentById(id, access_token as string),
    enabled: !!id && !!isAuthenticated,
    refetchOnWindowFocus: false,
  });

  return {
    document: query.data,
    isDocumentLoading: query.isLoading,
    ...query,
  };
};
