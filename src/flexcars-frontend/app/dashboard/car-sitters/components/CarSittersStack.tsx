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
import { DateInput, DatePicker, DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { Availability, CarSitter } from '@/app/types/CarSitters';
import { useUpdateCarSitter } from '../hooks/useReservationCarSitters';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';

const PAGE_SIZE = 4;

interface CarSittersStackProps {
  carSitters: CarSitter[];
  setCarSitters: React.Dispatch<React.SetStateAction<CarSitter[]>>;
}

export function CarSittersStack({ carSitters, setCarSitters }: Readonly<CarSittersStackProps>) {
  const [search, setSearch] = useState('');
  const [editCarSitter, setEditCarSitter] = useState<CarSitter | null>(null);
  const [formValues, setFormValues] = useState<Omit<CarSitter, 'id'>>({
    userId: '',
    assignedVehicleId: '',
    currentLocationLat: 0,
    currentLocationLng: 0,
    availability: Availability.BUSY,
    lastActiveAt: new Date(),
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updateCarSitterMutation = useUpdateCarSitter();
  const { data: users = [] } = useGetAllUser();
  const { data: vehicles = [] } = useGetAllVehicle();

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, `${u.firstName} ${u.lastName ?? ''}`])), [users]);
  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, `${v.brand} ${v.model}`])), [vehicles]);

  const filteredCarSitters = carSitters.filter((cs) =>
    [userMap[cs.userId], vehicleMap[cs.assignedVehicleId ?? ''], cs.availability]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCarSitters.length / PAGE_SIZE);
  const paginatedCarSitters = filteredCarSitters.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditClick = (cs: CarSitter) => {
    setEditCarSitter(cs);
    setFormValues(cs);
    open();
  };

  const handleFormChange = <K extends keyof CarSitter>(field: K, value: CarSitter[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editCarSitter?.id) return;
    updateCarSitterMutation.mutate(
      { id: editCarSitter.id, data: formValues },
      {
        onSuccess: () => {
          setCarSitters((prev) =>
            prev.map((cs) => (cs.id === editCarSitter.id ? { ...editCarSitter, ...formValues } : cs))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating car sitter:', error);
        },
      }
    );
  };

  const rows = paginatedCarSitters.map((cs) => (
    <Table.Tr key={cs.id}>
      <Table.Td>{userMap[cs.userId] || cs.userId}</Table.Td>
      <Table.Td>{vehicleMap[cs.assignedVehicleId ?? ''] || '—'}</Table.Td>
      <Table.Td>{cs.currentLocationLat ?? '—'}, {cs.currentLocationLng ?? '—'}</Table.Td>
      <Table.Td>{cs.availability}</Table.Td>
      <Table.Td>{cs.lastActiveAt ? new Date(cs.lastActiveAt).toLocaleString() : '—'}</Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(cs)}>
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
      <Title order={3}>Car Sitters</Title>

      <TextInput
        placeholder="Search by user, vehicle, availability..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {carSitters.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Vehicle</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Availability</Table.Th>
                  <Table.Th>Last Active</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Pagination total={totalPages} value={page} onChange={setPage} mt="md" />
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Car Sitter" centered>
        <Stack>
          <Select
            label="Availability"
            data={Object.values(Availability)}
            value={formValues.availability}
            onChange={(value) => handleFormChange('availability', value as Availability)}
          />
          
          <DateInput
            label="Last Active At"
            placeholder="Pick date"
            valueFormat="YYYY-MM-DD"
            value={formValues.lastActiveAt ?? null}
            onChange={(value) => handleFormChange('lastActiveAt', new Date(value as string) ?? undefined)}
          />

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
