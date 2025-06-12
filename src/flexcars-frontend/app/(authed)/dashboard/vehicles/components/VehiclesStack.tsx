'use client';

import { useState } from 'react';
import {
  ActionIcon,
  Avatar,
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
  NumberInput,
  Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { FuelType, Vehicle, VehicleStatus } from '@/app/types/Vehicle';
import { useUpdateVehicle } from '../hooks/useUpdateVehicle';

const PAGE_SIZE = 4;

interface VehiclesStackProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

export function VehiclesStack({ vehicles, setVehicles }: Readonly<VehiclesStackProps>) {
  const [search, setSearch] = useState('');
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [formValues, setFormValues] = useState<Omit<Vehicle, 'id'>>({
    companyId: '',
    brand: '',
    model: '',
    year: 2020,
    plateNumber: '',
    fuelType: FuelType.PETROL,
    currentMileage: 0,
    gpsEnabled: false,
    status: VehicleStatus.AVAILABLE,
    locationLat: undefined,
    locationLng: undefined,
    imageUrl: '',
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updateVehicleMutation = useUpdateVehicle();

  const filteredVehicles = vehicles?.filter((vehicle) =>
    [vehicle.brand, vehicle.model, vehicle.plateNumber, vehicle.fuelType, vehicle.status]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredVehicles.length / PAGE_SIZE);
  const paginatedVehicles = filteredVehicles.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleEditClick = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setFormValues(vehicle);
    open();
  };

  const handleFormChange = <K extends keyof Vehicle>(field: K, value: Vehicle[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editVehicle?.id) return;
    updateVehicleMutation.mutate(
      { id: editVehicle.id, data: formValues },
      {
        onSuccess: () => {
          setVehicles((prev) =>
            prev.map((v) => (v.id === editVehicle.id ? { ...editVehicle, ...formValues } : v))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating vehicle:', error);
        },
      }
    );
  };

  const rows = paginatedVehicles.map((vehicle) => (
    <Table.Tr key={vehicle.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={40} src={vehicle.imageUrl} radius={40} />
          <Text fz="sm" fw={500}>{vehicle.brand} {vehicle.model}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{vehicle.plateNumber}</Text>
        <Text fz="xs" c="dimmed">Plate</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{vehicle.fuelType}</Text>
        <Text fz="xs" c="dimmed">Fuel</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{vehicle.status}</Text>
        <Text fz="xs" c="dimmed">Status</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(vehicle)}>
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
      <Title order={3}>Vehicles</Title>

      <TextInput
        placeholder="Search by brand, model, plate..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {vehicles.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1000}>
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

      <Modal opened={opened} onClose={close} title="Edit Vehicle" centered>
        <Stack>
          <TextInput label="Brand" value={formValues.brand} onChange={(e) => handleFormChange('brand', e.currentTarget.value)} />
          <TextInput label="Model" value={formValues.model} onChange={(e) => handleFormChange('model', e.currentTarget.value)} />
          <NumberInput label="Year" value={formValues.year} onChange={(value) => handleFormChange('year', value || 0)} />
          <TextInput label="Plate Number" value={formValues.plateNumber} onChange={(e) => handleFormChange('plateNumber', e.currentTarget.value)} />
          <Select
            label="Fuel Type"
            data={Object.values(FuelType).map((f) => ({ label: f, value: f }))}
            value={formValues.fuelType}
            onChange={(value) => handleFormChange('fuelType', value as FuelType)}
          />
          <NumberInput label="Current Mileage" value={formValues.currentMileage} onChange={(value) => handleFormChange('currentMileage', value || 0)} />
          <Switch label="GPS Enabled" checked={formValues.gpsEnabled} onChange={(e) => handleFormChange('gpsEnabled', e.currentTarget.checked)} />
          <Select
            label="Status"
            data={Object.values(VehicleStatus).map((s) => ({ label: s, value: s }))}
            value={formValues.status}
            onChange={(value) => handleFormChange('status', value as VehicleStatus)}
          />
          <TextInput label="Image URL" value={formValues.imageUrl} onChange={(e) => handleFormChange('imageUrl', e.currentTarget.value)} />
          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
