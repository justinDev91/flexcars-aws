'use client';

import { redirect } from 'next/navigation';
import {
  Container,
  SimpleGrid,
  Loader,
  Badge,
  Group,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useGetVehicleById } from '../hooks/useGetVehicleById';
import { FeaturesCards } from '../../users/components/FeaturesCards';
import { CardWithStats } from '../../users/components/CardWithStats';
import { VehicleStatus } from '@/app/types/Vehicle';
import { VehicleMap } from '../components/VehicleMap';

interface DetailsProps {
  params: { id?: string };
}

export default function Details({ params }: Readonly<DetailsProps>) {
  const vehicleId = useMemo(() => params?.id ?? null, [params]);
  const { vehicle, isVehicleLoading, isError } = useGetVehicleById(vehicleId ?? '');

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!params?.id) {
      redirect('/auth/login');
    }
  }, [params]);

  useEffect(() => {
    if (
      vehicle?.status === VehicleStatus.RENTED &&
      vehicle.gpsEnabled &&
      vehicle.locationLat !== undefined &&
      vehicle.locationLng !== undefined
    ) {
      setPosition({ lat: vehicle.locationLat, lng: vehicle.locationLng });

      const interval = setInterval(() => {
        setPosition({ lat: vehicle.locationLat!, lng: vehicle.locationLng! });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [vehicle]);

  if (isVehicleLoading) {
    return (
      <Container my="md">
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (isError || !vehicle) {
    return (
      <Container my="md">
        <Group justify="center" mt="xl">
          <Badge color="red" size="lg">
            Failed to load vehicle data
          </Badge>
        </Group>
      </Container>
    );
  }

  const showMap =
    vehicle.status === VehicleStatus.RENTED &&
    vehicle.gpsEnabled &&
    vehicle.locationLat !== undefined &&
    vehicle.locationLng !== undefined;

  return (
    <Container my="md">
      <Group justify="center" my="lg">
        <Badge variant="filled" size="lg">
          Vehicle Services Details
        </Badge>
      </Group>

      {showMap && position && (
        <Container my="md">
          <Badge color="green" size="lg" mb="sm">
            Suivi en temps réel
          </Badge>
          <VehicleMap latitude={position.lat} longitude={position.lng} />
        </Container>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
        <CardWithStats />
        <CardWithStats />
      </SimpleGrid>
    </Container>
  );
}
