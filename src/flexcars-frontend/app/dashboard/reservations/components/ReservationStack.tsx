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
  Text,
  TextInput,
  Title,
  NumberInput,
  Select,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { Reservation, ReservationStatus } from '@/app/types/Reservation';
import { useUpdateReservation } from '../hooks/useReservationVehicle';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';

const PAGE_SIZE = 4;

interface ReservationsStackProps {
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
}

export function ReservationsStack({ reservations, setReservations }: Readonly<ReservationsStackProps>) {
  const [search, setSearch] = useState('');
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);
  const [formValues, setFormValues] = useState<Omit<Reservation, 'id'>>({
    vehicleId: '',
    customerId: '',
    startDatetime: '',
    endDatetime: '',
    pickupLocation: '',
    dropoffLocation: '',
    status: ReservationStatus.PENDING,
    totalPrice: undefined,
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updateReservationMutation = useUpdateReservation();
  const { data: users = [] } = useGetAllUser();
  const { data: vehicles = [] } = useGetAllVehicle();

  
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u.firstName])), [users]);
  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, `${v.brand} ${v.model}`])), [vehicles]);

  const filteredReservations = reservations.filter((r) =>
    [userMap[r.customerId], vehicleMap[r.vehicleId], r.pickupLocation, r.dropoffLocation, r.status]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredReservations.length / PAGE_SIZE);
  const paginatedReservations = filteredReservations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleEditClick = (reservation: Reservation) => {
    setEditReservation(reservation);
    setFormValues(reservation);
    open();
  };

  const handleFormChange = <K extends keyof Reservation>(field: K, value: Reservation[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editReservation?.id) return;
    updateReservationMutation.mutate(
      { id: editReservation.id, data: formValues },
      {
        onSuccess: () => {
          setReservations((prev) =>
            prev.map((r) => (r.id === editReservation.id ? { ...editReservation, ...formValues } : r))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating reservation:', error);
        },
      }
    );
  };

  const rows = paginatedReservations.map((r) => (
    <Table.Tr key={r.id}>
      <Table.Td>
        <Text fz="sm" fw={500}>{userMap[r.customerId] || r.customerId}</Text>
        <Text fz="xs" c="dimmed">Customer</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{vehicleMap[r.vehicleId] || r.vehicleId}</Text>
        <Text fz="xs" c="dimmed">Vehicle</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{new Date(r.startDatetime as string).toLocaleString()}</Text>
        <Text fz="xs" c="dimmed">Start</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{new Date(r.endDatetime as string).toLocaleString()}</Text>
        <Text fz="xs" c="dimmed">End</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{r.pickupLocation}</Text>
        <Text fz="xs" c="dimmed">Pickup</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{r.dropoffLocation}</Text>
        <Text fz="xs" c="dimmed">Dropoff</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{r.status}</Text>
        <Text fz="xs" c="dimmed">Status</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{r.totalPrice ? `€${r.totalPrice}` : '—'}</Text>
        <Text fz="xs" c="dimmed">Price</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(r)}>
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
      <Title order={3}>Reservations</Title>

      <TextInput
        placeholder="Search by customer, vehicle, location..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {reservations.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1200}>
            <Table verticalSpacing="md">
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            mt="md"
          />
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Reservation" centered>
        <Stack>
          <Select
            label="Customer"
            data={users.map((u) => ({ value: u.id, label: u.firstName }))}
            value={formValues.customerId}
            onChange={(value) => handleFormChange('customerId', value!)}
          />
          <Select
            label="Vehicle"
            data={vehicles.map((v) => ({ value: v.id, label: `${v.brand} ${v.model}` }))}
            value={formValues.vehicleId}
            onChange={(value) => handleFormChange('vehicleId', value!)}
          />
          <DateTimePicker
            label="Start Datetime"
            value={new Date(formValues.startDatetime as string)}
            onChange={(value) => handleFormChange('startDatetime', value?.toISOString() || '')}
          />
          <DateTimePicker
            label="End Datetime"
            value={new Date(formValues.endDatetime as string)}
            onChange={(value) => handleFormChange('endDatetime', value?.toISOString() || '')}
          />
          <TextInput label="Pickup Location" value={formValues.pickupLocation} onChange={(e) => handleFormChange('pickupLocation', e.currentTarget.value)} />
          <TextInput label="Dropoff Location" value={formValues.dropoffLocation} onChange={(e) => handleFormChange('dropoffLocation', e.currentTarget.value)} />
          <Select
            label="Status"
            data={Object.values(ReservationStatus).map((s) => ({ label: s, value: s }))}
            value={formValues.status}
            onChange={(value) => handleFormChange('status', value as ReservationStatus)}
          />
          <NumberInput label="Total Price (€)" value={formValues.totalPrice} onChange={(value) => handleFormChange('totalPrice', value || 0)} />
          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
