'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useGetAllCarSitters } from './hooks/useGetAllCarSitters';
import { CarSittersStack } from './components/CarSittersStack';
import { CarSitter } from '@/app/types/CarSitters';
import CreateCarSitterForm from './components/CreateCarSittersForm';

export default function CarSittersPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [carSitters, setCarSitters] = useState<CarSitter[]>([]);

  const { carSitters: fetchedCarSitters = [] } = useGetAllCarSitters();

  useEffect(() => {
    setCarSitters(fetchedCarSitters);
  }, [fetchedCarSitters]);

  const handleCarSitterCreated = (newCarSitter: CarSitter) => {
    setCarSitters((prev) => [newCarSitter, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Car Sitter
          </Button>
        </Group>

        <Stack>
          <CarSittersStack carSitters={carSitters} setCarSitters={setCarSitters} />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new car sitter" centered>
        <CreateCarSitterForm onSuccess={handleCarSitterCreated} />
      </Modal>
    </>
  );
}
