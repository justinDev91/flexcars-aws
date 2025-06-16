import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IMaintenance } from '@/app/types/Maintenance';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';

const MAINTENANCE_KEY = 'maintenances';

const createMaintenance = async (data: Omit<IMaintenance, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicle-maintenance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create maintenance');
  return response.json();
};

export const useCreateMaintenance = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: Omit<IMaintenance, 'id'>) => createMaintenance(data, access_token),
  });
};

const fetchAllMaintenance = async (access_token?: string): Promise<IMaintenance[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicle-maintenance`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch maintenance records');
  return response.json();
};

export const useGetAllMaintenance = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: [MAINTENANCE_KEY],
    queryFn: () => fetchAllMaintenance(access_token),
    enabled: !!isAuthenticated,
  });
};

const fetchMaintenanceById = async (id: string, access_token?: string): Promise<IMaintenance> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicle-maintenance/${id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch maintenance');
  return response.json();
};

export const useGetMaintenanceById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: [MAINTENANCE_KEY, id],
    queryFn: () => fetchMaintenanceById(id, access_token),
    enabled: !!isAuthenticated && !!id,
  });
};

const updateMaintenance = async (id: string, data: Partial<IMaintenance>, access_token?: string): Promise<IMaintenance> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicle-maintenance/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update maintenance');
  return response.json();
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IMaintenance> }) =>
      updateMaintenance(id, data, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_KEY] });
    },
  });
};
