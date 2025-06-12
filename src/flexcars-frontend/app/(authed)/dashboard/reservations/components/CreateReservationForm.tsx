'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCreateReservation } from '../hooks/useCreateReservation';
import {
  createReservationInitialValues,
  CreateReservationFormValues,
  createReservationSchema,
} from '@/app/validations/createReservation.schema';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { Reservation, ReservationStatus } from '@/app/types/Reservation';
import { zodResolver } from 'mantine-form-zod-resolver';

interface CreateReservationFormProps {
  onSuccess?: (reservation: Reservation) => void;
}

export default function CreateReservationForm({ onSuccess }: Readonly<CreateReservationFormProps>) {
  const createReservationMutation = useCreateReservation();
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetAllVehicle();
  const { data: users = [], isLoading: isUsersLoading } = useGetAllUser();

  const form = useForm<CreateReservationFormValues>({
    validate: zodResolver(createReservationSchema),
    initialValues: createReservationInitialValues,
  });

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
            data={vehicles.map((v) => ({
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
              form.setFieldValue('startDatetime', date as string )
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

          <TextInput
            label="Pickup Location"
            placeholder="e.g. 123 Main Street, Paris"
            {...form.getInputProps('pickupLocation')}
          />

          <TextInput
            label="Dropoff Location"
            placeholder="e.g. 456 Avenue de la République, Paris"
            {...form.getInputProps('dropoffLocation')}
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={Object.values(ReservationStatus).map((status) => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase(),
            }))}
            {...form.getInputProps('status')}
          />

          <NumberInput
            label="Total Price (€)"
            placeholder="e.g. 299.99"
            {...form.getInputProps('totalPrice')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">
            Create Reservation
          </Button>
        </Group>
      </form>
    </Box>
  );
}
