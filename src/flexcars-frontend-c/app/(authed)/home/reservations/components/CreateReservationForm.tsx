'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  Checkbox,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useCreateReservation } from '../hooks/useCreateReservation';
import {
  createReservationInitialValues,
  CreateReservationFormValues,
  createReservationSchema,
} from '@/app/validations/createReservation.schema';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { Reservation, Location } from '@/app/types/Reservation';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useUpdateVehicle } from '../../vehicles/hooks/useUpdateVehicle';
import { VehicleStatus } from '@/app/types/Vehicle';
import { useCalculateTotalPrice } from '../../pricing-rules/hooks/pricing-rules-api';

interface CreateReservationFormProps {
  onSuccess?: (reservation: Reservation) => void;
}

export default function CreateReservationForm({ onSuccess }: Readonly<CreateReservationFormProps>) {
  const createReservationMutation = useCreateReservation();
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetAllVehicle();
  const { data: users = [], isLoading: isUsersLoading } = useGetAllUser();
  const updateVehicleMutation = useUpdateVehicle();
  const { mutate: calculatePrice, data: calculatedPrice } = useCalculateTotalPrice();

  const form = useForm<CreateReservationFormValues>({
    validate: zodResolver(createReservationSchema),
    initialValues: createReservationInitialValues,
  });

  useEffect(() => {
    const { vehicleId, startDatetime, endDatetime } = form.values;

    if (vehicleId && startDatetime && endDatetime) {
      calculatePrice({
        vehicleId,
        startDate: new Date(startDatetime).toISOString(),
        endDate: new Date(endDatetime).toISOString(),
      });
    }
  }, [form.values.vehicleId, form.values.startDatetime, form.values.endDatetime]);

  useEffect(() => {
    if (calculatedPrice !== undefined) {
      form.setFieldValue('totalPrice', calculatedPrice);
    }
  }, [calculatedPrice]);

  const handleSubmit = (values: typeof form.values) => {
    const parsedValues = {
      ...values,
      startDatetime: new Date(values.startDatetime).toISOString(),
      endDatetime: new Date(values.endDatetime).toISOString(),
    };

    createReservationMutation.mutate(parsedValues, {
      onSuccess: (newReservation) => {
        form.reset();
        onSuccess?.(newReservation);
      },
      onError: (error) => {
        console.error('Error creating reservation:', error);
      },
    });
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Vehicle"
            placeholder={isVehiclesLoading ? 'Loading vehicles...' : 'Select a vehicle'}
            data={vehicles
              .filter((v) => v.status === 'AVAILABLE') 
              .map((v) => ({
              value: v.id,
              label: `${v.brand} ${v.model} (${v.plateNumber})`,
            }))}
            searchable
            clearable
            disabled={isVehiclesLoading}
            {...form.getInputProps('vehicleId')}
          />

          <Select
            label="Customer"
            placeholder={isUsersLoading ? 'Loading users...' : 'Select a customer'}
            data={users.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName ?? ''}`,
            }))}
            searchable
            clearable
            disabled={isUsersLoading}
            {...form.getInputProps('customerId')}
          />

          <DateTimePicker
            label="Start Datetime"
            placeholder="Pick start date and time"
            value={form.values.startDatetime}
            onChange={(date) =>
              form.setFieldValue('startDatetime', date as string)
            }
          />

          <DateTimePicker
            label="End Datetime"
            placeholder="Pick end date and time"
            value={form.values.endDatetime}
            onChange={(date) =>
              form.setFieldValue('endDatetime', date as string)
            }
          />

          <Select
            label="Pickup Location"
            placeholder="Select pickup location"
            data={Object.values(Location).map((loc) => ({
              value: loc,
              label: loc.replace(/_/g, ' '),
            }))}
            {...form.getInputProps('pickupLocation')}
          />

          <Select
            label="Dropoff Location"
            placeholder="Select dropoff location"
            data={Object.values(Location).map((loc) => ({
              value: loc,
              label: loc.replace(/_/g, ' '),
            }))}
            {...form.getInputProps('dropoffLocation')}
          />

          <NumberInput
            label="Total Price (€)"
            placeholder="e.g. 299.99"
            {...form.getInputProps('totalPrice')}
            disabled
          />

          <Checkbox
            label="Car Sitting Option"
            {...form.getInputProps('carSittingOption', { type: 'checkbox' })}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Reservation</Button>
        </Group>
      </form>
    </Box>
  );
}
