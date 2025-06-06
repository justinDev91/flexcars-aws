'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { FeaturesCards } from './components/FeaturesCards';
import { CompaniesStack } from './components/CompaniesStack';
import CreateCompanyForm from './components/CreateCompanyForm';

export default function Users() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Container fluid px="md" py="md">
        <FeaturesCards />
        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Company
          </Button>
        </Group>

        <Stack>
          <CompaniesStack />
        </Stack>
      </Container>
    
      <Modal opened={opened} onClose={close} title="Create a new user for" centered>
        <CreateCompanyForm onSuccess={close} />
      </Modal>

    </>
  );
}
