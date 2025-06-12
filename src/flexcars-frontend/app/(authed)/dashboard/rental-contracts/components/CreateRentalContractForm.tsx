'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useGetAllReservation } from '../../reservations/hooks/useGetAllReservation';
import { RentalContract } from '@/app/types/RentalContract';
import { useCreateRentalContract } from '../hooks/useCreateRentalContact';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { CreateRentalContractFormValues, createRentalContractInitialValues, createRentalContractSchema } from '@/app/validations/RentalContract.schema';

interface CreateRentalContractFormProps {
  onSuccess?: (contract: RentalContract) => void;
}

export default function CreateRentalContractForm({ onSuccess }: Readonly<CreateRentalContractFormProps>) {
  const createRentalContractMutation = useCreateRentalContract();
  const { data: users = [], isLoading: isUsersLoading } = useGetAllUser();
  const { data: reservations = [], isLoading: isReservationsLoading } = useGetAllReservation();

  const form = useForm<CreateRentalContractFormValues>({
    validate: zodResolver(createRentalContractSchema),
    initialValues: createRentalContractInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    const parsedValues = {
      ...values,
      signedAt: new Date(values.signedAt).toISOString(),
    };

    createRentalContractMutation.mutate(parsedValues, {
      onSuccess: (newContract) => {
        form.reset();
        onSuccess?.(newContract);
      },
      onError: (error) => {
        console.error('Error creating rental contract:', error);
      },
    });
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Reservation"
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
            label="PDF URL"
            placeholder="https://example.com/contract.pdf"
            {...form.getInputProps('pdfUrl')}
          />

          <Select
            label="Signed by Customer"
            placeholder={isUsersLoading ? 'Loading users...' : 'Select a customer'}
            data={users.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName ?? ''}`,
            }))}
            searchable
            clearable
            disabled={isUsersLoading}
            {...form.getInputProps('signedByCustomerId')}
          />

          <Select
            label="Signed by Agent"
            placeholder={isUsersLoading ? 'Loading users...' : 'Select an agent'}
            data={users.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName ?? ''}`,
            }))}
            searchable
            clearable
            disabled={isUsersLoading}
            {...form.getInputProps('signedByAgentId')}
          />

          <DateInput
            label="Signed At"
            value={form.values.signedAt}
            onChange={(date) => form.setFieldValue('signedAt', date as string)}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Rental Contract</Button>
        </Group>
      </form>
    </Box>
  );
}
