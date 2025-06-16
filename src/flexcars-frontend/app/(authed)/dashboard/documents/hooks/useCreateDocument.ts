import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Document } from '@/app/types/Document';
import { useMutation } from '@tanstack/react-query';

const createDocument = async (data: Omit<Document, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create document');
  }

  return response.json();
};

export const useCreateDocument = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: Omit<Document, 'id'>) => createDocument(data, access_token as string),
  });
};
