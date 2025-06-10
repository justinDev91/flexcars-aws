'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useCreateCarSitter } from '../hooks/useCreateCarSitters';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { CreateCarSitterFormValues, createCarSitterInitialValues, createCarSitterSchema } from '@/app/validations/carsSitters.schema';
import { Availability, CarSitter } from '@/app/types/CarSitters';

interface CreateCarSitterFormProps {
  onSuccess?: (carSitters: CarSitter) => void;
}

export default function CreateCarSitterForm({ onSuccess }: Readonly<CreateCarSitterFormProps>) {
  const createCarSitterMutation = useCreateCarSitter();
  const { data: users = [], isLoading: isUsersLoading } = useGetAllUser();
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetAllVehicle();

  const form = useForm<CreateCarSitterFormValues>({
    validate: zodResolver(createCarSitterSchema),
    initialValues: createCarSitterInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    createCarSitterMutation.mutate(values, {
      onSuccess: (newCarSitter) => {
        form.reset();
        onSuccess?.(newCarSitter);
      },
      onError: (error) => {
        console.error('Error creating car sitter:', error);
      },
    });
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="User"
            placeholder={isUsersLoading ? 'Loading users...' : 'Select a user'}
            data={users.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName ?? ''}`,
            }))}
            searchable
            clearable
            disabled={isUsersLoading}
            {...form.getInputProps('userId')}
          />

          <Select
            label="Assigned Vehicle"
            placeholder={isVehiclesLoading ? 'Loading vehicles...' : 'Select a vehicle'}
            data={vehicles.map((v) => ({
              value: v.id,
              label: `${v.brand} ${v.model} (${v.plateNumber})`,
            }))}
            searchable
            clearable
            disabled={isVehiclesLoading}
            {...form.getInputProps('assignedVehicleId')}
          />

          <NumberInput
            label="Current Latitude"
            placeholder="e.g. 48.8566"
            value={form.values.currentLocationLat}
            allowDecimal
            hideControls
          />

          <NumberInput
            label="Current Longitude"
            placeholder="e.g. 2.3522"
            value={form.values.currentLocationLng}
            allowDecimal
            hideControls
          />

          <Select
            label="Availability"
            placeholder="Select availability"
            data={Object.values(Availability).map((status) => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase(),
            }))}
            {...form.getInputProps('availability')}
          />

          <DateInput
            label="Last Active At"
            placeholder="Pick date and time"
            value={form.values.lastActiveAt ?? null}
            onChange={(date) => form.setFieldValue('lastActiveAt', new Date(date as string))}
          />

        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Car Sitter</Button>
        </Group>
      </form>
    </Box>
  );
}
