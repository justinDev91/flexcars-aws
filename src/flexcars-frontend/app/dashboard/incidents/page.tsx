'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import CreateIncidentForm from './components/CreateIncidentForm';
import { useState, useEffect } from 'react';
import { Incident } from '@/app/types/Incident';
import { useGetAllIncidents } from './hooks/useGetAllIncident';
import { IncidentsStack } from './components/IncidentStack';

export default function IncidentPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const { data: fetchedIncidents = [] } = useGetAllIncidents();

  useEffect(() => {
    setIncidents(fetchedIncidents);
  }, [fetchedIncidents]);

  const handleIncidentCreated = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Incident
          </Button>
        </Group>

        <Stack>
          <IncidentsStack
            incidents={incidents}
            setIncidents={setIncidents}
          />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new incident" centered>
        <CreateIncidentForm onSuccess={handleIncidentCreated} />
      </Modal>
    </>
  );
}
