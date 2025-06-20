'use client';

import { useState } from 'react';
import { Button, TextInput, NumberInput, Stack, Notification } from '@mantine/core';
import { useDropVehicle } from '../../../reservations/hooks/useDropVehicle';
import CreatePaymentForm from '../../../payments/components/CreatePaymentForm';

export default function DropVehicleWithPayment() {
  const [firstName, setFirstName] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [currentMileage, setCurrentMileage] = useState<number | ''>(0);
  const [paymentDone, setPaymentDone] = useState(false);
  const [dropRequested, setDropRequested] = useState(false);

  const {
    dropVehicleAsync,
    data: dropData,
    dropError,
  } = useDropVehicle();

  const handleDropRequest = async () => {
    if (typeof currentMileage !== 'number') return;

    try {
      const result = await dropVehicleAsync({
        firstName,
        reservationId,
        currentMileage,
      });

      if (result.penaltyAmount && result.penaltyAmount > 0) {
        setDropRequested(true); 
      } else {
        setPaymentDone(true); 
      }
    } catch (error) {
      console.error('Drop failed:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentDone(true);
  };

  return (
    <Stack>
      <TextInput
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.currentTarget.value)}
      />
      <TextInput
        label="Reservation ID"
        value={reservationId}
        onChange={(e) => setReservationId(e.currentTarget.value)}
      />
      <NumberInput
        label="Current Mileage"
        value={currentMileage}
        onChange={(value) => setCurrentMileage(typeof value === 'number' ? value : 0)}
      />

      {!dropRequested && !paymentDone && (
        <Button onClick={handleDropRequest}>
          Drop Vehicle
        </Button>
      )}

      {dropRequested && dropData?.penaltyAmount !== undefined && !paymentDone && (
        <CreatePaymentForm
          invoiceId={dropData.invoiceId}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {paymentDone && (
        <Notification color="green" title="Drop Completed">
          Vehicle dropped and payment processed.
        </Notification>
      )}

      {dropError && (
        <Notification color="red" title="Error">
          Failed to drop vehicle. Please try again.
        </Notification>
      )}
    </Stack>
  );
}
