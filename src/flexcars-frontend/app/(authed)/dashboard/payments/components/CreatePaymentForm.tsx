'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useGetAllInvoice } from '../../invoices/hooks/useGetAllInvoice';
import { useCreatePayment } from '../hooks/useCreatePayment';
import {
  createPaymentSchema,
  createPaymentInitialValues,
  CreatePaymentFormValues,
} from '@/app/validations/payment.schema';
import { Payment, PaymentMethod, PaymentStatus } from '@/app/types/Payment';

interface CreatePaymentFormProps {
  invoiceId?: string;
  onSuccess?: (payment: Payment) => void;
}

export default function CreatePaymentForm({
  invoiceId,
  onSuccess,
}: Readonly<CreatePaymentFormProps>) {
  const createPaymentMutation = useCreatePayment();
  const { data: invoices = [], isLoading: isInvoicesLoading } = useGetAllInvoice();

  const form = useForm<CreatePaymentFormValues>({
    validate: zodResolver(createPaymentSchema),
    initialValues: {
      ...createPaymentInitialValues,
      invoiceId: invoiceId ?? '',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    createPaymentMutation.mutate(values, {
      onSuccess: (newPayment) => {
        form.reset();
        onSuccess?.(newPayment);
      },
      onError: (error) => {
        console.error('Error creating payment:', error);
      },
    });
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Invoice"
            placeholder={isInvoicesLoading ? 'Loading invoices...' : 'Select an invoice'}
            data={invoices.map((inv) => ({
              value: inv.id,
              label: `${inv.invoiceNumber} - €${inv.amount}`,
            }))}
            searchable
            clearable={!invoiceId}
            disabled={isInvoicesLoading || !!invoiceId}
            {...form.getInputProps('invoiceId')}
          />

          <Select
            label="Payment Method"
            data={Object.values(PaymentMethod).map((method) => ({
              value: method,
              label: method.replace('_', ' '),
            }))}
            {...form.getInputProps('method')}
          />

          <TextInput
            label="Transaction ID"
            placeholder="e.g. txn_123456789"
            {...form.getInputProps('transactionId')}
          />

          <Select
            label="Status"
            data={Object.values(PaymentStatus).map((status) => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase(),
            }))}
            {...form.getInputProps('status')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">
            Create Payment
          </Button>
        </Group>
      </form>
    </Box>
  );
}
