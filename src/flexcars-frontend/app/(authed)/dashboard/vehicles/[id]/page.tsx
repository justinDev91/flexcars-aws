'use client';

import { redirect, useParams } from 'next/navigation';
import {
  Container,
  SimpleGrid,
  Loader,
  Badge,
  Group,
} from '@mantine/core';
import { useEffect} from 'react';
import { useGetVehicleById } from '../hooks/useGetVehicleById';
import { CardWithStats } from '../../users/components/CardWithStats';
import { VehicleStatus } from '@/app/types/Vehicle';
import { VehicleMap } from '../components/VehicleMap';
import { useVehiclePosition } from '../hooks/useVehiclePosition'; 

export default function Details() {
  const params = useParams<{ id: string}>()
  
  const { vehicle, isVehicleLoading, isError } = useGetVehicleById(params.id ?? '');
  const position = useVehiclePosition(params.id ?? '');

  useEffect(() => {
    if (!params.id) {
      redirect('/auth/login');
    }
  }, [params.id]);

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
    position !== null;

  return (
    <Container my="md">
      <Group justify="center" my="lg">
        <Badge variant="filled" size="lg">
          Vehicle Services Details
        </Badge>
      </Group>

      {showMap && (
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
