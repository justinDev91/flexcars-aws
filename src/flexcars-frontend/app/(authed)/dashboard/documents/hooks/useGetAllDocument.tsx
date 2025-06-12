import { Document } from '@/app/types/Document';
import { useQuery } from '@tanstack/react-query';

const fetchAllDocuments = async (access_token?: string): Promise<Document[]> => {
  const url = new URL('/documents', process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
};

export const useGetAllDocuments = () => {
  const access_token = window.localStorage.getItem("token");

  const query = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchAllDocuments(access_token as string),
    refetchOnWindowFocus: false,
  });

  return {
    documents: query.data || [],
    isDocumentsLoading: query.isLoading,
    ...query,
  };
};
