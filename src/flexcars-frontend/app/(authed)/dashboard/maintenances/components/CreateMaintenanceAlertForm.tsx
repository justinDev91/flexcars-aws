'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  TextInput,
  NumberInput,
  Switch,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useCreateMaintenanceAlert } from '../hooks/maintenance-alert.api';
import { CreateMaintenanceAlertFormValues, createMaintenanceAlertInitialValues, createMaintenanceAlertSchema } from '@/app/validations/maintenance-alert.schema';
import { AlertType } from '@/app/types/MaintenanceAlert';

interface CreateMaintenanceAlertFormProps {
  onSuccess?: (alert: any) => void;
}

export default function CreateMaintenanceAlertForm({
  onSuccess,
}: Readonly<CreateMaintenanceAlertFormProps>) {
  const createAlertMutation = useCreateMaintenanceAlert();
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetAllVehicle();

  const form = useForm<CreateMaintenanceAlertFormValues>({
    validate: zodResolver(createMaintenanceAlertSchema),
    initialValues: createMaintenanceAlertInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    const parsedValues = {
      ...values,
      alertDate: new Date(values.alertDate).toISOString(),
    };

    createAlertMutation.mutate(parsedValues, {
      onSuccess: (newAlert) => {
        form.reset();
        onSuccess?.(newAlert);
      },
      onError: (error) => {
        console.error('Error creating maintenance alert:', error);
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

          <NumberInput
            label="Mileage Trigger (km)"
            placeholder="e.g. 15000"
            {...form.getInputProps('mileageTrigger')}
          />

          <Switch
            label="Recurring"
            {...form.getInputProps('recurring', { type: 'checkbox' })}
          />

          <DateTimePicker
            label="Alert Date"
            placeholder="Pick alert date and time"
            value={form.values.alertDate}
            onChange={(date) => form.setFieldValue('alertDate', date as string)}
          />

          <Select
            label="Alert Type"
            placeholder="Select alert type"
            data={Object.values(AlertType).map((type) => ({
              value: type,
              label: type.charAt(0) + type.slice(1).toLowerCase(),
            }))}
            {...form.getInputProps('alertType')}
          />

          <TextInput
            label="Message"
            placeholder="e.g. Maintenance due in 3 days or 500 km"
            {...form.getInputProps('message')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Maintenance Alert</Button>
        </Group>
      </form>
    </Box>
  );
}
