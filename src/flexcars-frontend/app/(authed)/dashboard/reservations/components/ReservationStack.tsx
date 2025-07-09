'use client';

import { useState, useMemo } from 'react';
import {
  ActionIcon,
  Button,
  Checkbox,
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
import { Reservation, ReservationStatus, Location } from '@/app/types/Reservation';
import { useUpdateReservation } from '../hooks/useReservationVehicle';
import { useGetAllVehicle } from '../../vehicles/hooks/useGetAllVehicle';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    pickupLocation: Location.SAINT_DENIS,
    dropoffLocation: Location.ISSY_LES_MOULINEAUX,
    status: ReservationStatus.PENDING,
    totalPrice: undefined,
    carSittingOption: false,
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    doc.setFontSize(18);
    doc.text('Reservations', 40, 40);
    autoTable(doc, {
      startY: 60,
      head: [[
        'Customer',
        'Vehicle',
        'Start',
        'End',
        'Pickup',
        'Dropoff',
        'Status',
        'Price',
        'Car Sitting',
      ]],
      body: reservations.map(r => [
        userMap[r.customerId] || r.customerId || '',
        vehicleMap[r.vehicleId] || r.vehicleId || '',
        new Date(r.startDatetime as string).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
        new Date(r.endDatetime as string).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
        r?.pickupLocation?.replace(/_/g, ' ') || '',
        r?.dropoffLocation?.replace(/_/g, ' ') || '',
        r.status || '',
        r.totalPrice ? `€${Number(r.totalPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
        r.carSittingOption ? 'Yes' : 'No',
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 6,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        halign: 'center',
        textColor: 50,
      },
      columnStyles: {
        0: { cellWidth: 80 }, // Customer
        1: { cellWidth: 100 }, // Vehicle
        2: { cellWidth: 90 }, // Start
        3: { cellWidth: 90 }, // End
        4: { cellWidth: 90 }, // Pickup
        5: { cellWidth: 110 }, // Dropoff
        6: { cellWidth: 70 }, // Status
        7: { cellWidth: 70 }, // Price
        8: { cellWidth: 70 }, // Car Sitting
      },
      tableWidth: 'auto',
      margin: { left: 40, right: 40 },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('fr-FR')}`, 40, doc.internal.pageSize.getHeight() - 10);
      },
    });
    doc.save('reservations.pdf');
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
      <Group justify="space-between" mb="sm">
        <TextInput
          placeholder="Search by customer, vehicle, location..."
          mb={0}
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
        />
        <Button onClick={handleDownloadPDF} variant="outline">Download PDF</Button>
      </Group>

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
          <TextInput
            label="Customer"
            value={userMap[formValues.customerId] || formValues.customerId}
            readOnly
            disabled
          />

          <TextInput
            label="Vehicle"
            value={vehicleMap[formValues.vehicleId] || formValues.vehicleId}
            readOnly
            disabled
          />

          <DateTimePicker
            label="Start Datetime"
            value={new Date(formValues.startDatetime as string)}
            onChange={(value) =>
              handleFormChange('startDatetime', new Date(value as string).toISOString() || '')
            }
          />

          <DateTimePicker
            label="End Datetime"
            value={new Date(formValues.endDatetime as string)}
            onChange={(value) =>
              handleFormChange('endDatetime', new Date(value as string).toISOString() || '')
            }
          />

          <Select
            label="Pickup Location"
            data={Object.values(Location).map((loc) => ({
              value: loc,
              label: loc.replace(/_/g, ' '),
            }))}
            value={formValues.pickupLocation}
            onChange={(value) => handleFormChange('pickupLocation', value as Location)}
          />

          <Select
            label="Dropoff Location"
            data={Object.values(Location).map((loc) => ({
              value: loc,
              label: loc.replace(/_/g, ' '),
            }))}
            value={formValues.dropoffLocation}
            onChange={(value) => handleFormChange('dropoffLocation', value as Location)}
          />

          <Select
            label="Status"
            data={Object.values(ReservationStatus).map((s) => ({ label: s, value: s }))}
            value={formValues.status}
            onChange={(value) => handleFormChange('status', value as ReservationStatus)}
          />

          <NumberInput
            label="Total Price (€)"
            value={formValues.totalPrice}
            readOnly
            disabled
          />

          <Checkbox
            label="Car Sitting Option"
            checked={formValues.carSittingOption}
            onChange={(event) =>
              handleFormChange('carSittingOption', event.currentTarget.checked)
            }
          />

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
