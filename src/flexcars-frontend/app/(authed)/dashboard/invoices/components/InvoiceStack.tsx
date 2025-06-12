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
  NumberInput,
  Select,
} from '@mantine/core';
import { DateInput, DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { Invoice, InvoiceStatus } from '@/app/types/Invoice';
import { useGetAllReservation } from '../../reservations/hooks/useGetAllReservation';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { useUpdateInvoice } from '../hooks/useInvoiceIncident';

const PAGE_SIZE = 4;

interface InvoicesStackProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

export function InvoicesStack({ invoices, setInvoices }: Readonly<InvoicesStackProps>) {
  const [search, setSearch] = useState('');
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [formValues, setFormValues] = useState<Omit<Invoice, 'id'>>({
    reservationId: '',
    invoiceNumber: '',
    amount: 0,
    dueDate: '',
    paidAt: '',
    status: InvoiceStatus.UNPAID,
    penaltyAmount: undefined,
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updateInvoiceMutation = useUpdateInvoice();
  const { data: reservations = [] } = useGetAllReservation();
  const { data: users = [] } = useGetAllUser();

  const reservationMap = useMemo(() => Object.fromEntries(reservations.map(r => [r.id, `${r.pickupLocation} → ${r.dropoffLocation}`])), [reservations]);

  const filteredInvoices = invoices.filter((inv) =>
    [inv.invoiceNumber, reservationMap[inv.reservationId], inv.status]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  const paginatedInvoices = filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditClick = (invoice: Invoice) => {
    setEditInvoice(invoice);
    setFormValues(invoice);
    open();
  };

  const handleFormChange = <K extends keyof Invoice>(field: K, value: Invoice[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editInvoice?.id) return;
    updateInvoiceMutation.mutate(
      { id: editInvoice.id, data: formValues },
      {
        onSuccess: () => {
          setInvoices((prev) =>
            prev.map((i) => (i.id === editInvoice.id ? { ...editInvoice, ...formValues } : i))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating invoice:', error);
        },
      }
    );
  };

  const rows = paginatedInvoices.map((inv) => (
    <Table.Tr key={inv.id}>
      <Table.Td>{inv.invoiceNumber}</Table.Td>
      <Table.Td>{reservationMap[inv.reservationId] || inv.reservationId}</Table.Td>
      <Table.Td>{inv.amount} €</Table.Td>
      <Table.Td>{inv.penaltyAmount ?? '—'} €</Table.Td>
      <Table.Td>{new Date(inv.dueDate).toLocaleDateString()}</Table.Td>
      <Table.Td>{inv.status}</Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(inv)}>
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
      <Title order={3}>Invoices</Title>

      <TextInput
        placeholder="Search by invoice number, reservation, status..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {invoices.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Invoice #</Table.Th>
                  <Table.Th>Reservation</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Penalty</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Pagination total={totalPages} value={page} onChange={setPage} mt="md" />
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Invoice" centered>
        <Stack>
          <TextInput
            label="Invoice Number"
            value={formValues.invoiceNumber ?? ''}
            onChange={(e) => handleFormChange('invoiceNumber', e.currentTarget.value)}
            disabled
          />

          <NumberInput
            label="Amount"
            value={formValues.amount}
            min={0}
            prefix="€"
          />

          <NumberInput
            label="Penalty Amount"
            value={formValues.penaltyAmount}
            min={0}
            prefix="€"
          />

          <Select
            label="Status"
            data={Object.values(InvoiceStatus).map((s) => ({ label: s, value: s }))}
            value={formValues.status}
            onChange={(value) => handleFormChange('status', value as InvoiceStatus)}
          />

          <DateInput
            label="Due Date"
            value={formValues.dueDate ? new Date(formValues.dueDate) : null}
            onChange={(date) => handleFormChange('dueDate', date as string)}
            disabled
          />

          <DateInput
            label="Paid At"
            value={formValues.paidAt ? new Date(formValues.paidAt) : null}
            onChange={(date) => handleFormChange('paidAt', date as string)}
          />

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
