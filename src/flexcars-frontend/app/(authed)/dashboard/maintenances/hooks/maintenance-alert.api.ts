import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IMaintenanceAlert } from '@/app/types/MaintenanceAlert';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';

const ALERT_KEY = 'maintenance-alerts';

const createAlert = async (data: Omit<IMaintenanceAlert, 'id'>, access_token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance-alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create maintenance alert');
  return response.json();
};

export const useCreateMaintenanceAlert = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: (data: Omit<IMaintenanceAlert, 'id'>) => createAlert(data, access_token),
  });
};

const fetchAllAlerts = async (access_token?: string): Promise<IMaintenanceAlert[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance-alerts`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch maintenance alerts');
  return response.json();
};

export const useGetAllMaintenanceAlerts = () => {
  const { access_token, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: [ALERT_KEY],
    queryFn: () => fetchAllAlerts(access_token as string),
    enabled: !!isAuthenticated,
  });
};

const fetchAlertById = async (id: string, access_token?: string): Promise<IMaintenanceAlert> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance-alerts/${id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch maintenance alert');
  return response.json();
};

export const useGetMaintenanceAlertById = (id: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: [ALERT_KEY, id],
    queryFn: () => fetchAlertById(id, access_token as string),
    enabled: !!isAuthenticated && !!id,
  });
};

const updateAlert = async (id: string, data: Partial<IMaintenanceAlert>, access_token?: string): Promise<IMaintenanceAlert> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance-alerts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update maintenance alert');
  return response.json();
};

export const useUpdateMaintenanceAlert = () => {
  const queryClient = useQueryClient();
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IMaintenanceAlert> }) =>
      updateAlert(id, data, access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERT_KEY] });
    },
  });
};
