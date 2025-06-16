import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
});

export function useVehiclePosition(vehicleId: string) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const handlePosition = (data: any) => {
      if (data.id === vehicleId) {
        setPosition({ lat: data.latitude, lng: data.longitude });
      }
    };

    socket.on('vehicle-position', handlePosition);

    return () => {
      socket.off('vehicle-position', handlePosition);
    };
  }, [vehicleId]);

  return position;
}
