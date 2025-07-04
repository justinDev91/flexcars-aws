import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Reservation } from '@/app/types/Reservation';
import { Vehicle } from '@/app/types/Vehicle';
import { useQuery } from '@tanstack/react-query';

const SCAN_RESERVATION_KEY = 'scan-reservation';

interface ScanReservationResponse {
  reservation: Reservation;
  vehicle: Vehicle;
}

const fetchScannedReservation = async (
  identifier: string,
  access_token?: string
): Promise<ScanReservationResponse> => {
  const url = new URL(`/reservations/scan/${identifier}`, process.env.NEXT_PUBLIC_API_URL);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to scan reservation');
  }

  return response.json();
};


export const useScanReservation = (identifier: string) => {
  const { access_token, isAuthenticated } = useAuthSession();

  const query = useQuery({
    queryKey: [SCAN_RESERVATION_KEY, identifier],
    queryFn: () => fetchScannedReservation(identifier, access_token as string),
    enabled: !!isAuthenticated && !!identifier,
    refetchOnWindowFocus: false,
  });

  return {
    scannedReservation: query.data?.reservation,
    scannedVehicle: query.data?.vehicle,
    isScanning: query.isLoading,
    ...query,
  };
};
