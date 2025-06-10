'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  TextInput,
  NumberInput,
} from '@mantine/core';
import { DateInput, DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useGetAllReservation } from '../../reservations/hooks/useGetAllReservation';
import { Invoice, InvoiceStatus } from '@/app/types/Invoice';
import { useCreateInvoice } from '../hooks/useCreateInvoice';
import { invoiceInitialValues, invoiceSchema } from '@/app/validations/Invoice.schema';


interface CreateInvoiceFormProps {
  onSuccess?: (invoice: Invoice) => void;
}


export default function CreateInvoiceForm({ onSuccess }: Readonly<CreateInvoiceFormProps>) {
  const { data: reservations = [], isLoading: isReservationsLoading } = useGetAllReservation();
  const createInvoiceMutation = useCreateInvoice();

  const form = useForm({
    validate: zodResolver(invoiceSchema),
    initialValues: invoiceInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    const parsedValues = {
      ...values,
      dueDate: new Date(values.dueDate).toISOString(),
      paidAt: values.paidAt ? new Date(values.paidAt).toISOString() : undefined,
    };

    createInvoiceMutation.mutate(parsedValues, {
      onSuccess: (newInvoice) => {
        form.reset();
        onSuccess?.(newInvoice);
      },
      onError: (error) => {
        console.error('Error creating invoice:', error);
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
            label="Invoice Number"
            placeholder="INV-2025-001"
            {...form.getInputProps('invoiceNumber')}
          />

          <NumberInput
            label="Amount"
            prefix="€"
            min={0}
            {...form.getInputProps('amount')}
          />

          <NumberInput
            label="Penalty Amount"
            prefix="€"
            min={0}
            {...form.getInputProps('penaltyAmount')}
          />

          <Select
            label="Status"
            data={Object.values(InvoiceStatus).map((status) => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase(),
            }))}
            {...form.getInputProps('status')}
          />

          <DateInput
            label="Due Date"
            value={form.values.dueDate}
            onChange={(date) => form.setFieldValue('dueDate', date as string)}

          />

          <DateInput
            label="Paid At"
            value={form.values.paidAt}
            onChange={(date) => form.setFieldValue('paidAt', date as string)}

          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Invoice</Button>
        </Group>
      </form>
    </Box>
  );
}
