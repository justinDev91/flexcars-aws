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
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { RentalContract } from '@/app/types/RentalContract';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { useGetAllReservation } from '../../reservations/hooks/useGetAllReservation';
import { useUpdateRentalContract } from '../hooks/useRentalContactVehicle';

const PAGE_SIZE = 4;

interface RentalContractsStackProps {
  rentalContracts: RentalContract[];
  setRentalContracts: React.Dispatch<React.SetStateAction<RentalContract[]>>;
}

export function RentalContractsStack({ rentalContracts, setRentalContracts }: Readonly<RentalContractsStackProps>) {
  const [search, setSearch] = useState('');
  const [editContract, setEditContract] = useState<RentalContract | null>(null);
  const [formValues, setFormValues] = useState<Omit<RentalContract, 'id'>>({
    reservationId: '',
    pdfUrl: '',
    signedByCustomerId: '',
    signedByAgentId: '',
    signedAt: new Date().toISOString(),
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updateContractMutation = useUpdateRentalContract();
  const { data: users = [] } = useGetAllUser();
  const { reservations = [] } = useGetAllReservation();

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, `${u.firstName} ${u.lastName ?? ''}`])), [users]);
  const reservationMap = useMemo(() => Object.fromEntries(reservations.map(r => [r.id, `${r.pickupLocation} → ${r.dropoffLocation}`])), [reservations]);

  const filteredContracts = rentalContracts.filter((c) =>
    [userMap[c.signedByCustomerId], userMap[c.signedByAgentId], reservationMap[c.reservationId]]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredContracts.length / PAGE_SIZE);
  const paginatedContracts = filteredContracts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditClick = (contract: RentalContract) => {
    setEditContract(contract);
    setFormValues(contract);
    open();
  };

  const handleFormChange = <K extends keyof RentalContract>(field: K, value: RentalContract[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editContract?.id) return;
    updateContractMutation.mutate(
      { id: editContract.id, data: formValues },
      {
        onSuccess: () => {
          setRentalContracts((prev) =>
            prev.map((c) => (c.id === editContract.id ? { ...editContract, ...formValues } : c))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating rental contract:', error);
        },
      }
    );
  };

  const rows = paginatedContracts.map((c) => (
    <Table.Tr key={c.id}>
      <Table.Td>{reservationMap[c.reservationId] || c.reservationId}</Table.Td>
      <Table.Td>{userMap[c.signedByCustomerId] || c.signedByCustomerId}</Table.Td>
      <Table.Td>{userMap[c.signedByAgentId] || c.signedByAgentId}</Table.Td>
      <Table.Td>{new Date(c.signedAt).toLocaleString()}</Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(c)}>
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
      <Title order={3}>Rental Contracts</Title>

      <TextInput
        placeholder="Search by customer, agent, reservation..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {rentalContracts.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Reservation</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Agent</Table.Th>
                  <Table.Th>Signed At</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Pagination total={totalPages} value={page} onChange={setPage} mt="md" />
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Rental Contract" centered>
        <Stack>
          <TextInput
            label="Reservation"
            value={reservationMap[formValues.reservationId] || formValues.reservationId}
            readOnly
            disabled
          />

          <TextInput
            label="Customer"
            value={userMap[formValues.signedByCustomerId] || formValues.signedByCustomerId}
            readOnly
            disabled
          />

          <TextInput
            label="Agent"
            value={userMap[formValues.signedByAgentId] || formValues.signedByAgentId}
            readOnly
            disabled
          />

          <TextInput
            label="PDF URL"
            value={formValues.pdfUrl ?? ''}
            onChange={(e) => handleFormChange('pdfUrl', e.currentTarget.value)}
          />

          <DateTimePicker
            label="Signed At"
            value={new Date(formValues.signedAt)}
            onChange={(value) =>
              handleFormChange('signedAt', new Date(value as string).toISOString())
            }
          />

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
