'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { FeaturesCards } from '../companies/components/FeaturesCards';
import CreateRentalContractForm from './components/CreateRentalContractForm';
import { useState, useEffect } from 'react';
import { RentalContract } from '@/app/types/RentalContract';
import { useGetAllRentalContracts } from './hooks/useGetAllRentalContract';
import { RentalContractsStack } from './components/RentalContractStack';

export default function RentalContractPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [rentalContracts, setRentalContracts] = useState<RentalContract[]>([]);

  const { rentalContracts: fetchedContracts = [] } = useGetAllRentalContracts();

  useEffect(() => {
    setRentalContracts(fetchedContracts);
  }, [fetchedContracts]);

  const handleContractCreated = (newContract: RentalContract) => {
    setRentalContracts((prev) => [newContract, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <FeaturesCards />

        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Rental Contract
          </Button>
        </Group>

        <Stack>
          <RentalContractsStack
            rentalContracts={rentalContracts}
            setRentalContracts={setRentalContracts}
          />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new rental contract" centered>
        <CreateRentalContractForm onSuccess={handleContractCreated} />
      </Modal>
    </>
  );
}
