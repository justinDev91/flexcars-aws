'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { useState, useEffect } from 'react';

import { IMaintenance } from '@/app/types/Maintenance';
import { useGetAllMaintenance } from './hooks/maintenance.api';
import MaintenanceAndAlertsStack from './components/MaintenancesStack';
import CreateMaintenanceForm from './components/CreateMaintenanceForm';

export default function MaintenancePage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [maintenances, setMaintenances] = useState<IMaintenance[]>([]);

  const { data: fetchedMaintenances = [] } = useGetAllMaintenance();

  useEffect(() => {
    setMaintenances(fetchedMaintenances);
  }, [fetchedMaintenances]);

  const handleMaintenanceCreated = (newMaintenance: IMaintenance) => {
    setMaintenances((prev) => [newMaintenance, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Maintenance
          </Button>
        </Group>

        <Stack>
          <MaintenanceAndAlertsStack />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new maintenance" centered>
        <CreateMaintenanceForm onSuccess={handleMaintenanceCreated} />
      </Modal>
    </>
  );
}