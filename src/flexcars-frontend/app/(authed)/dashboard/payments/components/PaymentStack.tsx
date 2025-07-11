'use client';

import { useState, useMemo } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Stack,
  Table,
  TextInput,
  Title,
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { Payment, PaymentMethod, PaymentStatus } from '@/app/types/Payment';
import { useUpdatePayment } from '../hooks/useUpdatePayment';
import { useGetAllInvoice } from '../../invoices/hooks/useGetAllInvoice';

const PAGE_SIZE = 4;

interface PaymentsStackProps {
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

export function PaymentsStack({ payments, setPayments }: Readonly<PaymentsStackProps>) {
  const [search, setSearch] = useState('');
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [formValues, setFormValues] = useState<Omit<Payment, 'id'>>({
    invoiceId: '',
    method: PaymentMethod.STRIPE,
    transactionId: '',
    status: PaymentStatus.PENDING,
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updatePaymentMutation = useUpdatePayment();
  const { data: invoices = [] } = useGetAllInvoice();

  const invoiceMap = useMemo(
    () => Object.fromEntries(invoices.map((inv) => [inv.id, `${inv.invoiceNumber} - €${inv.amount}`])),
    [invoices]
  );

  const filteredPayments = payments.filter((p) =>
    [invoiceMap[p.invoiceId], p.method, p.status, p.transactionId]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPayments.length / PAGE_SIZE);
  const paginatedPayments = filteredPayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditClick = (payment: Payment) => {
    setEditPayment(payment);
    setFormValues(payment);
    open();
  };

  const handleFormChange = <K extends keyof Payment>(field: K, value: Payment[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editPayment?.id) return;
    updatePaymentMutation.mutate(
      { id: editPayment.id, data: formValues },
      {
        onSuccess: () => {
          setPayments((prev) =>
            prev.map((p) => (p.id === editPayment.id ? { ...editPayment, ...formValues } : p))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating payment:', error);
        },
      }
    );
  };

  const rows = paginatedPayments.map((p) => (
    <Table.Tr key={p.id}>
      <Table.Td>{invoiceMap[p.invoiceId] || p.invoiceId}</Table.Td>
      <Table.Td>{p.method}</Table.Td>
      <Table.Td>{p.transactionId || '—'}</Table.Td>
      <Table.Td>{p.status}</Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(p)}>
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray">
            <IconDots size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Title order={3}>Payments</Title>

      <TextInput
        placeholder="Search by invoice, method, status..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {payments.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Invoice</Table.Th>
                  <Table.Th>Method</Table.Th>
                  <Table.Th>Transaction ID</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Paid At</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Pagination total={totalPages} value={page} onChange={setPage} mt="md" />
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Payment" centered>
        <Stack>
          <TextInput
            label="Invoice"
            value={invoiceMap[formValues.invoiceId] || formValues.invoiceId}
            readOnly
            disabled
          />

          <Select
            label="Method"
            data={Object.values(PaymentMethod).map((m) => ({ label: m, value: m }))}
            value={formValues.method}
            onChange={(value) => handleFormChange('method', value as PaymentMethod)}
          />

          <TextInput
            label="Transaction ID"
            value={formValues.transactionId ?? ''}
            onChange={(e) => handleFormChange('transactionId', e.currentTarget.value)}
          />

          <Select
            label="Status"
            data={Object.values(PaymentStatus).map((s) => ({ label: s, value: s }))}
            value={formValues.status}
            onChange={(value) => handleFormChange('status', value as PaymentStatus)}
          />

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
