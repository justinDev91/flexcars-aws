'use client';

import { useState, useMemo } from 'react';
import {
  Group,
  Loader,
  Pagination,
  Stack,
  Table,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { useGetAllMaintenance } from '../hooks/maintenance.api';
import { useGetAllMaintenanceAlerts } from '../hooks/maintenance-alert.api';

const PAGE_SIZE = 5;

export default function MaintenanceAndAlertsStack() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: vehicles = [] } = useGetAllVehicle();
  const { data: maintenances = [] } = useGetAllMaintenance();
  const { data: alerts = [] } = useGetAllMaintenanceAlerts();

  const vehicleMap = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, `${v.brand} ${v.model}`])),
    [vehicles]
  );

  const filteredMaintenances = maintenances.filter((m) =>
    [vehicleMap[m.vehicleId], m.type, m.status, m.notes]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAlerts = alerts.filter((a) =>
    [vehicleMap[a.vehicleId], a.alertType, a.message]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil((filteredMaintenances.length + filteredAlerts.length) / PAGE_SIZE);

  return (
    <Stack>
      <Title order={3}>Maintenance & Alerts</Title>

      <TextInput
        placeholder="Search by vehicle, type, status, message..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      <Title order={4}>Maintenance Records</Title>
      {maintenances.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <Table.ScrollContainer minWidth={1000}>
          <Table verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Vehicle</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Scheduled</Table.Th>
                <Table.Th>Completed</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Notes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredMaintenances.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((m) => (
                <Table.Tr key={m.id}>
                  <Table.Td>{vehicleMap[m.vehicleId] || m.vehicleId}</Table.Td>
                  <Table.Td>{m.type}</Table.Td>
                  <Table.Td>{m.scheduledDate ? new Date(m.scheduledDate).toLocaleString() : '—'}</Table.Td>
                  <Table.Td>{m.completedDate ? new Date(m.completedDate).toLocaleString() : '—'}</Table.Td>
                  <Table.Td>{m.status}</Table.Td>
                  <Table.Td>{m.notes || '—'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Title order={4} mt="xl">Maintenance Alerts</Title>
      {alerts.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <Table.ScrollContainer minWidth={1000}>
          <Table verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Vehicle</Table.Th>
                <Table.Th>Alert Type</Table.Th>
                <Table.Th>Alert Date</Table.Th>
                <Table.Th>Mileage Trigger</Table.Th>
                <Table.Th>Recurring</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Resolved</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAlerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((a) => (
                <Table.Tr key={a.id}>
                  <Table.Td>{vehicleMap[a.vehicleId] || a.vehicleId}</Table.Td>
                  <Table.Td>{a.alertType}</Table.Td>
                  <Table.Td>{new Date(a.alertDate).toLocaleString()}</Table.Td>
                  <Table.Td>{a.mileageTrigger ?? '—'}</Table.Td>
                  <Table.Td>{a.recurring ? 'Yes' : 'No'}</Table.Td>
                  <Table.Td>{a.message}</Table.Td>
                  <Table.Td>{a.resolved ? 'Yes' : 'No'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Pagination
        total={totalPages}
        value={page}
        onChange={setPage}
        mt="md"
      />
    </Stack>
  );
}
