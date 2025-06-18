'use client';

import { useState } from 'react';
import { Stepper, Button, Group, Modal } from '@mantine/core';
import CreateReservationForm from '../../reservations/components/CreateReservationForm';

export default function RentalStepper() {
  const [active, setActive] = useState(0);
  const [modalOpened, setModalOpened] = useState(true); 

  const nextStep = () => setActive((current) => (current < 9 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleReservationSuccess = (reservation: any) => {
    console.log('Reservation created:', reservation);
    setModalOpened(false);
    nextStep();
  };

  return (
    <>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Reservation" description="Create reservation" />
        <Stepper.Step label="Documents" description="Verify documents" />
        <Stepper.Step label="Invoice" description="Generate invoice" />
        <Stepper.Step label="Payment" description="Process payment" />
        <Stepper.Step label="Contract" description="Send contract" />
        <Stepper.Step label="Signature" description="Sign contract" />
        <Stepper.Step label="Confirmation" description="Confirm reservation" />
        <Stepper.Completed>All steps completed</Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>Back</Button>
        <Button onClick={() => setModalOpened(true)}>Open Step Modal</Button>
      </Group>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Step 1: Create Reservation"
        size="lg"
        centered
      >
        {active === 0 && <CreateReservationForm onSuccess={handleReservationSuccess} />}
      </Modal>
    </>
  );
}
