'use client';

import { useState } from 'react';
import { Button, TextInput, NumberInput, Stack, Notification } from '@mantine/core';
import { useDropVehicle } from '../../../reservations/hooks/useDropVehicle';

export default function DropVehicleForm() {
  const [firstName, setFirstName] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [currentMileage, setCurrentMileage] = useState<number | ''>(0);

  const {
    dropVehicle,
    dropSuccess,
    data: dropData,
    dropError,
  } = useDropVehicle();

  const handleDrop = () => {
    if (typeof currentMileage === 'number') {
      dropVehicle({
        firstName,
        reservationId,
        currentMileage,
      });
    }
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

      <Button onClick={handleDrop} >
        Drop Vehicle
      </Button>

      {dropSuccess && (
        <Notification color="green" title="Drop Successful">
          Vehicle dropped. Penalty: €{dropData?.penaltyAmount ?? 0}
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
