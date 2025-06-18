'use client';

import { useState } from 'react';
import { Stepper, Button, Group, Modal, Stack, Title } from '@mantine/core';
import CreateReservationForm from '../../reservations/components/CreateReservationForm';
import CreateDocumentForm from '../../documents/components/CreateDocumentForm';
import CreatePaymentForm from '../../payments/components/CreatePaymentForm'; // Adjust path if needed
import { Payment } from '@/app/types/Payment';

export default function RentalStepper() {
  const [active, setActive] = useState(0);
  const [modalOpened, setModalOpened] = useState(true);
  const [driverLicenseCreated, setDriverLicenseCreated] = useState(false);
  const [idCardCreated, setIdCardCreated] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);

  const nextStep = () => setActive((current) => (current < 6 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleReservationSuccess = (reservation: any) => {
    console.log('Reservation created:', reservation);
    setModalOpened(false);
    nextStep();
  };

  const handleDocumentSuccess = (type: 'DRIVER_LICENSE' | 'ID_CARD') => {
    console.log(`${type} document created`);
    if (type === 'DRIVER_LICENSE') setDriverLicenseCreated(true);
    if (type === 'ID_CARD') setIdCardCreated(true);
  };

  const handlePaymentSuccess = (payment: Payment) => {
    console.log('Payment created:', payment);
    setPaymentCreated(true);
    setModalOpened(false);
    nextStep();
  };

  const allDocumentsCreated = driverLicenseCreated && idCardCreated;

  return (
    <>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Reservation" description="Create reservation" />
        <Stepper.Step label="Documents" description="Verify documents" />
        <Stepper.Step label="Payment" description="Process payment" />
        <Stepper.Step label="Contract" description="Send contract" />
        <Stepper.Step label="Signature" description="Sign contract" />
        <Stepper.Step label="Confirmation" description="Confirm reservation" />
        <Stepper.Completed>All steps completed</Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>Back</Button>
        <Button onClick={() => setModalOpened(true)}>Open Step Modal</Button>
        {active === 1 && allDocumentsCreated && (
          <Button onClick={() => {
            setModalOpened(false);
            nextStep();
          }}>
            Continue to Payment
          </Button>
        )}
      </Group>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          active === 0
            ? 'Step 1: Create Reservation'
            : active === 1
            ? 'Step 2: Upload Required Documents'
            : active === 2
            ? 'Step 3: Create Payment'
            : 'Step Modal'
        }
        size="lg"
        centered
      >
        {active === 0 && <CreateReservationForm onSuccess={handleReservationSuccess} />}

        {active === 1 && (
          <Stack>
            <Title order={4}>Required Documents</Title>
            {!driverLicenseCreated && (
              <CreateDocumentForm
                onSuccess={() => handleDocumentSuccess('DRIVER_LICENSE')}
              />
            )}
            {!idCardCreated && (
              <CreateDocumentForm
                onSuccess={() => handleDocumentSuccess('ID_CARD')}
              />
            )}
          </Stack>
        )}

        {active === 2 && (
          <CreatePaymentForm onSuccess={handlePaymentSuccess} />
        )}
      </Modal>
    </>
  );
}
