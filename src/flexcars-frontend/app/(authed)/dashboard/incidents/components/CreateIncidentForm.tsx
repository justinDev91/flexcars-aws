'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Incident, IncidentSeverity, IncidentStatus } from '@/app/types/Incident';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useCreateIncident } from '../hooks/useCreateIncident';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { useGetAllReservation } from '../../reservations/hooks/useGetAllReservation';
import {
  CreateIncidentFormValues,
  createIncidentInitialValues,
  createIncidentSchema,
} from '@/app/validations/incident.schema';

interface CreateIncidentFormProps {
  onSuccess?: (incident: Incident) => void;
}

export default function CreateIncidentForm({ onSuccess }: Readonly<CreateIncidentFormProps>) {
  const createIncidentMutation = useCreateIncident();
  const { data: users = [], isLoading: isUsersLoading } = useGetAllUser();
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetAllVehicle();
  const { data: reservations = [], isLoading: isReservationsLoading } = useGetAllReservation();

  const form = useForm<CreateIncidentFormValues>({
    validate: zodResolver(createIncidentSchema),
    initialValues: createIncidentInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    const parsedValues = {
      ...values,
      reportedAt: new Date(values.reportedAt).toISOString(),
      resolvedAt: values.resolvedAt ? new Date(values.resolvedAt).toISOString() : undefined,
    };

    createIncidentMutation.mutate(parsedValues, {
      onSuccess: (newIncident) => {
        form.reset();
        onSuccess?.(newIncident);
      },
      onError: (error) => {
        console.error('Error creating incident:', error);
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
            label="Reported By"
            placeholder={isUsersLoading ? 'Loading users...' : 'Select a user'}
            data={users.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName ?? ''}`,
            }))}
            searchable
            clearable
            disabled={isUsersLoading}
            {...form.getInputProps('reportedById')}
          />

          <Select
            label="Reservation (optional)"
            placeholder={isReservationsLoading ? 'Loading reservations...' : 'Select a reservation'}
            data={reservations.map((r) => ({
              value: r.id,
              label: `${r.pickupLocation} → ${r.dropoffLocation}`,
            }))}
            searchable
            clearable
            disabled={isReservationsLoading}
            {...form.getInputProps('reservationId')}
          />

          <TextInput
            label="Location"
            placeholder="e.g. 123 Main Street, Paris"
            {...form.getInputProps('location')}
          />

          <Select
            label="Severity"
            placeholder="Select severity"
            data={Object.values(IncidentSeverity).map((severity) => ({
              value: severity,
              label: severity.charAt(0) + severity.slice(1).toLowerCase(),
            }))}
            {...form.getInputProps('severity')}
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={Object.values(IncidentStatus).map((status) => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' '),
            }))}
            {...form.getInputProps('status')}
          />

          <TextInput
            label="Photos URL"
            placeholder="https://example.com/photo.jpg"
            {...form.getInputProps('photosUrl')}
          />

          <DateTimePicker
            label="Reported At"
            placeholder="Pick date and time"
            value={form.values.reportedAt}
            onChange={(date) =>
              form.setFieldValue('reportedAt', date as string)
            }
          />

          <DateTimePicker
            label="Resolved At"
            placeholder="Pick date and time (optional)"
            value={form.values.resolvedAt}
            onChange={(date) =>
              form.setFieldValue('resolvedAt', date as string)
            }
          />

          <Textarea
            label="Description"
            placeholder="Describe the incident"
            autosize
            minRows={3}
            {...form.getInputProps('description')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">
            Create Incident
          </Button>
        </Group>
      </form>
    </Box>
  );
}
