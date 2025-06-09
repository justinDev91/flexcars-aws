'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { FeaturesCards } from '../companies/components/FeaturesCards';
import { VehiclesStack } from './components/VehiclesStack';
import CreateVehicleForm from './components/CreateVehicleForm';
import { useState, useEffect } from 'react';
import { Vehicle } from '@/app/types/Vehicle';
import { useGetAllVehicle } from './hooks/useGetAllVehicle';

export default function VehiclesPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const { data: fetchedVehicles = [] } = useGetAllVehicle();

  useEffect(() => {
    setVehicles(fetchedVehicles);
  }, [fetchedVehicles]);

  const handleVehicleCreated = (newVehicle: Vehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <FeaturesCards />

        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Vehicle
          </Button>
        </Group>

        <Stack>
          <VehiclesStack vehicles={vehicles} setVehicles={setVehicles} />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new vehicle" centered>
        <CreateVehicleForm onSuccess={handleVehicleCreated} />
      </Modal>
    </>
  );
}
