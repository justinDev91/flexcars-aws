'use client';

import {
  Box,
  Button,
  Group,
  TextInput,
  Stack,
  Select,
  NumberInput,
  Switch,
} from '@mantine/core';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useForm } from '@mantine/form';
import { useCreateVehicle } from '../hooks/useCreateVehicle';
import { CreateVehicleFormValues, createVehicleInitialValues, createVehicleSchema } from '@/app/validations/createVehicle.schema';
import { useGetAllCompany } from '../../companies/hooks/useGetAllCompany';
import { Vehicle } from '@/app/types/Vehicle';

interface CreateVehicleFormProps {
  onSuccess?: (vehicle: Vehicle) => void;
}


export default function CreateVehicleForm({ onSuccess }: Readonly<CreateVehicleFormProps>) {
  const createVehicleMutation = useCreateVehicle();
  const { companies, isCompaniesLoading } = useGetAllCompany();

  const form = useForm<CreateVehicleFormValues>({
    validate: zodResolver(createVehicleSchema),
    initialValues: createVehicleInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    createVehicleMutation.mutate(values, {
      onSuccess: (newVehicle) => {
        form.reset();
        if (onSuccess) onSuccess(newVehicle); 
      },
      onError: (error) => {
        console.error('Error creating vehicle:', error);
      },
    });
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Company"
            placeholder={isCompaniesLoading ? 'Loading companies...' : 'Select a company'}
            data={companies.map((company) => ({
              value: company.id,
              label: company.name,
            }))}
            searchable
            clearable
            disabled={isCompaniesLoading}
            {...form.getInputProps('companyId')}
          />

          <TextInput
            label="Brand"
            placeholder="e.g. Toyota"
            required
            {...form.getInputProps('brand')}
          />

          <TextInput
            label="Model"
            placeholder="e.g. Corolla"
            required
            {...form.getInputProps('model')}
          />

          <NumberInput
            label="Year"
            placeholder="e.g. 2020"
            required
            {...form.getInputProps('year')}
          />

          <TextInput
            label="Plate Number"
            placeholder="e.g. ABC1234"
            required
            {...form.getInputProps('plateNumber')}
          />

          <Select
            label="Fuel Type"
            placeholder="Select fuel type"
            data={[
              { value: 'PETROL', label: 'Petrol' },
              { value: 'DIESEL', label: 'Diesel' },
              { value: 'ELECTRIC', label: 'Electric' },
              { value: 'HYBRID', label: 'Hybrid' },
            ]}
            required
            {...form.getInputProps('fuelType')}
          />

          <NumberInput
            label="Current Mileage"
            placeholder="e.g. 15000"
            required
            {...form.getInputProps('currentMileage')}
          />

          <Switch
            label="GPS Enabled"
            {...form.getInputProps('gpsEnabled', { type: 'checkbox' })}
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'RESERVED', label: 'Reserved' },
              { value: 'RENTED', label: 'Rented' },
              { value: 'MAINTENANCE', label: 'Maintenance' },
              { value: 'INCIDENT', label: 'Incident' },
            ]}
            required
            {...form.getInputProps('status')}
          />

          <NumberInput
            label="Latitude"
            placeholder="e.g. 41.3851"
            {...form.getInputProps('locationLat')}
          />

          <NumberInput
            label="Longitude"
            placeholder="e.g. 2.1734"
            {...form.getInputProps('locationLng')}
          />

          <TextInput
            label="Image URL"
            placeholder="https://example.com/vehicle.png"
            {...form.getInputProps('imageUrl')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Vehicle</Button>
        </Group>
      </form>
    </Box>
  );
}
