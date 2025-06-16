'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useCreateMaintenance } from '../hooks/maintenance.api';
import { CreateMaintenanceFormValues, createMaintenanceInitialValues, createMaintenanceSchema } from '@/app/validations/maintenance.schema';
import { MaintenanceStatus, MaintenanceType } from '@/app/types/Maintenance';

interface CreateMaintenanceFormProps {
  onSuccess?: (maintenance: any) => void;
}

export default function CreateMaintenanceForm({ onSuccess }: Readonly<CreateMaintenanceFormProps>) {
  const createMaintenanceMutation = useCreateMaintenance();
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetAllVehicle();

  const form = useForm<CreateMaintenanceFormValues>({
    validate: zodResolver(createMaintenanceSchema),
    initialValues: createMaintenanceInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    const parsedValues = {
      ...values,
      scheduledDate: values.scheduledDate ? new Date(values.scheduledDate).toISOString() : undefined,
      completedDate: values.completedDate ? new Date(values.completedDate).toISOString() : undefined,
    };

    createMaintenanceMutation.mutate(parsedValues, {
      onSuccess: (newMaintenance) => {
        form.reset();
        onSuccess?.(newMaintenance);
      },
      onError: (error) => {
        console.error('Error creating maintenance:', error);
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
            label="Maintenance Type"
            placeholder="Select type"
            data={Object.values(MaintenanceType).map((type) => ({
              value: type,
              label: type.replace('_', ' ').toLowerCase(),
            }))}
            {...form.getInputProps('type')}
          />

          <DateTimePicker
            label="Scheduled Date"
            placeholder="Pick scheduled date"
            value={form.values.scheduledDate}
            onChange={(date) => form.setFieldValue('scheduledDate', date as string)}
          />

          <DateTimePicker
            label="Completed Date"
            placeholder="Pick completed date"
            value={form.values.completedDate}
            onChange={(date) => form.setFieldValue('completedDate', date as string)}
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={Object.values(MaintenanceStatus).map((status) => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase(),
            }))}
            {...form.getInputProps('status')}
          />

          <TextInput
            label="Notes"
            placeholder="e.g. Changed oil and checked tire pressure"
            {...form.getInputProps('notes')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Maintenance</Button>
        </Group>
      </form>
    </Box>
  );
}
