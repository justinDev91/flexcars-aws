'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import LeadGrid from './components/LeadGrid';
import { UsersStack } from './components/UsersStack';
import CreateUserForm from './components/create-user-modal';

export default function Users() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Container fluid px="md" py="md">
        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create user
          </Button>
        </Group>

        <Stack>
          <UsersStack />
          <LeadGrid />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new user for" centered>
        <CreateUserForm />
      </Modal>
    </>
  );
}
