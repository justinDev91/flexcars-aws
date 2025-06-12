import { Company } from '@/app/types/company';
import { useMutation } from '@tanstack/react-query';

const createCompany = async (companyData: Omit<Company, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    throw new Error('Failed to create company');
  }

  return response.json();
};

export const useCreateCompany = () => {
  const access_token = window.localStorage.getItem("token");

  return useMutation({
    mutationFn: (companyData: Omit<Company, 'id'>) =>
      createCompany(companyData , access_token as string),
  });
};
