'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack } from '@mantine/core';
import LeadGrid from './components/LeadGrid';
import { UsersStack } from './components/UsersStack';
import CreateUserForm from './components/create-user-modal';

export default function Users() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Stack pb="md">
        <LeadGrid />
        <UsersStack />
      </Stack>

      <Modal opened={opened} onClose={close} title="Create a new user" centered>
        <CreateUserForm />
      </Modal>

      <Button
        variant="default"
        onClick={open}
      >
        Create user
      </Button>
    </>
  );
}
