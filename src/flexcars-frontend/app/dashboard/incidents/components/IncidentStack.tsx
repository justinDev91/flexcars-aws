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
  Select,
  Textarea,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { Incident, IncidentSeverity, IncidentStatus } from '@/app/types/Incident';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { useGetAllReservation } from '../../reservations/hooks/useGetAllReservation';
import { useUpdateIncident } from '../hooks/useReservationIncident';

const PAGE_SIZE = 4;

interface IncidentsStackProps {
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
}

export function IncidentsStack({ incidents, setIncidents }: Readonly<IncidentsStackProps>) {
  const [search, setSearch] = useState('');
  const [editIncident, setEditIncident] = useState<Incident | null>(null);
  const [formValues, setFormValues] = useState<Omit<Incident, 'id'>>({
    vehicleId: '',
    reportedById: '',
    description: '',
    reservationId: '',
    location: '',
    severity: IncidentSeverity.LOW,
    photosUrl: '',
    status: IncidentStatus.OPEN,
    reportedAt: '',
    resolvedAt: '',
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updateIncidentMutation = useUpdateIncident();
  const { data: users = [] } = useGetAllUser();
  const { data: vehicles = [] } = useGetAllVehicle();
  const { reservations = [] } = useGetAllReservation();

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, `${u.firstName} ${u.lastName ?? ''}`])), [users]);
  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, `${v.brand} ${v.model}`])), [vehicles]);
  const reservationMap = useMemo(() => Object.fromEntries(reservations.map(r => [r.id, `${r.pickupLocation} → ${r.dropoffLocation}`])), [reservations]);

  const filteredIncidents = incidents.filter((i) =>
    [userMap[i.reportedById], vehicleMap[i.vehicleId], reservationMap[i.reservationId ?? ''], i.location, i.description, i.status, i.severity]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredIncidents.length / PAGE_SIZE);
  const paginatedIncidents = filteredIncidents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditClick = (incident: Incident) => {
    setEditIncident(incident);
    setFormValues(incident);
    open();
  };

  const handleFormChange = <K extends keyof Incident>(field: K, value: Incident[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editIncident?.id) return;
    updateIncidentMutation.mutate(
      { id: editIncident.id, data: formValues },
      {
        onSuccess: () => {
          setIncidents((prev) =>
            prev.map((i) => (i.id === editIncident.id ? { ...editIncident, ...formValues } : i))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating incident:', error);
        },
      }
    );
  };

  const rows = paginatedIncidents.map((i) => (
    <Table.Tr key={i.id}>
      <Table.Td>{userMap[i.reportedById] || i.reportedById}</Table.Td>
      <Table.Td>{vehicleMap[i.vehicleId] || i.vehicleId}</Table.Td>
      <Table.Td>{reservationMap[i.reservationId ?? ''] || '—'}</Table.Td>
      <Table.Td>{new Date(i.reportedAt ?? '').toLocaleString()}</Table.Td>
      <Table.Td>{i.severity}</Table.Td>
      <Table.Td>{i.status}</Table.Td>
      <Table.Td>{i.description}</Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(i)}>
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
      <Title order={3}>Incidents</Title>

      <TextInput
        placeholder="Search by user, vehicle, reservation..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {incidents.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1200}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Reported By</Table.Th>
                  <Table.Th>Vehicle</Table.Th>
                  <Table.Th>Reservation</Table.Th>
                  <Table.Th>Reported At</Table.Th>
                  <Table.Th>Severity</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Pagination total={totalPages} value={page} onChange={setPage} mt="md" />
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Incident" centered>
        <Stack>
          <TextInput label="Reported By" value={userMap[formValues.reportedById] || formValues.reportedById} disabled />
          <TextInput label="Vehicle" value={vehicleMap[formValues.vehicleId] || formValues.vehicleId} disabled />
          <TextInput label="Reservation" value={reservationMap[formValues.reservationId ?? ''] || ''} disabled />

          <DateTimePicker
            label="Reported At"
            value={formValues.reportedAt ? new Date(formValues.reportedAt) : null}
            onChange={(value) => handleFormChange('reportedAt', new Date(value as string).toISOString())}
            disabled
          />

          <DateTimePicker
            label="Resolved At"
            value={formValues.resolvedAt ? new Date(formValues.resolvedAt) : null}
            onChange={(value) => handleFormChange('resolvedAt', new Date(value as string).toISOString())}
          />

          <TextInput
            label="Location"
            value={formValues.location ?? ''}
            onChange={(e) => handleFormChange('location', e.currentTarget.value)}
          />

          <Select
            label="Severity"
            data={Object.values(IncidentSeverity).map((s) => ({ label: s, value: s }))}
            value={formValues.severity}
            onChange={(value) => handleFormChange('severity', value as IncidentSeverity)}
          />

          <Select
            label="Status"
            data={Object.values(IncidentStatus).map((s) => ({ label: s, value: s }))}
            value={formValues.status}
            onChange={(value) => handleFormChange('status', value as IncidentStatus)}
          />

          <Textarea
            label="Description"
            value={formValues.description ?? ''}
            onChange={(e) => handleFormChange('description', e.currentTarget.value)}
          />

          <TextInput
            label="Photos URL"
            value={formValues.photosUrl ?? ''}
            onChange={(e) => handleFormChange('photosUrl', e.currentTarget.value)}
          />

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
