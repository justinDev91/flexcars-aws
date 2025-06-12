'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { FeaturesCards } from '../companies/components/FeaturesCards';
import CreateReservationForm from './components/CreateReservationForm';
import { useState, useEffect } from 'react';
import { Reservation } from '@/app/types/Reservation';
import { useGetAllReservation } from './hooks/useGetAllReservation';
import { ReservationsStack } from './components/ReservationStack';

export default function ReservationPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const { data: fetchedReservations = [] } = useGetAllReservation();

  useEffect(() => {
    setReservations(fetchedReservations);
  }, [fetchedReservations]);

  const handleReservationCreated = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <FeaturesCards />

        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Reservation
          </Button>
        </Group>

        <Stack>
          <ReservationsStack
            reservations={reservations}
            setReservations={setReservations}
          />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new reservation" centered>
        <CreateReservationForm onSuccess={handleReservationCreated} />
      </Modal>
    </>
  );
}
