'use client';

import { useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Group,
  Menu,
  Table,
  Text,
  TextInput,
  Pagination,
  Stack,
  Modal,
  Button,
  Select,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDots,
  IconMessages,
  IconNote,
  IconPencil,
  IconReportAnalytics,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { UpdateUser } from '@/types/user';
import { useFindAllUsers, User } from '../hooks/useFindUsers';

const companies = [
  { label: 'Acme Corp', value: 'acme-001' },
  { label: 'Globex Inc.', value: 'globex-002' },
  { label: 'Initech', value: 'initech-003' },
  { label: 'Umbrella Corp', value: 'umbrella-004' },
];

const PAGE_SIZE = 4;
const PAGE_SIZE_PAGINATION = PAGE_SIZE + 1;

export function UsersStack() {
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UpdateUser | null>(null);
  const [formValues, setFormValues] = useState<UpdateUser>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyId: '',
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const { users = [], isUsersLoading } = useFindAllUsers({
    page,
    limit: PAGE_SIZE,
  });

  const filteredUsers = users.filter((user) =>
    [user.firstName, user.lastName, user.email].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleEditClick = (user: User) => {
    const updateUser: UpdateUser = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      companyId: user.companyId || '',
    };
    setEditUser(updateUser);
    setFormValues(updateUser);
    open();
  };

  const handleFormChange = (field: keyof UpdateUser, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Updated user:', formValues);
    close();
  };

  const rows = paginatedUsers.map((user) => (
    <Table.Tr key={user.email}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={40} src={user.avatar} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {user.firstName} {user.lastName}
            </Text>
            <Text c="dimmed" fz="xs">
              {user.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{user.phoneNumber || '—'}</Text>
        <Text fz="xs" c="dimmed">Phone</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">
          {user.birthDate ? new Date(user.birthDate).toLocaleDateString('fr-FR') : '—'}
        </Text>
        <Text fz="xs" c="dimmed">Birth Date</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{user.company || '—'}</Text>
        <Text fz="xs" c="dimmed">Company</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(user)}>
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
          <Menu transitionProps={{ transition: 'pop' }} withArrow position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconMessages size={16} stroke={1.5} />}>Send message</Menu.Item>
              <Menu.Item leftSection={<IconNote size={16} stroke={1.5} />}>Add note</Menu.Item>
              <Menu.Item leftSection={<IconReportAnalytics size={16} stroke={1.5} />}>Analytics</Menu.Item>
              <Menu.Item leftSection={<IconTrash size={16} stroke={1.5} />} color="red">
                Terminate contract
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <TextInput
        placeholder="Search by name or email"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {isUsersLoading ? (
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

          {PAGE_SIZE_PAGINATION >= 1 && (
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              mt="md"
            />
          )}
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit User" centered>
        <Stack>
          <TextInput
            label="First Name"
            value={formValues.firstName}
            onChange={(e) => handleFormChange('firstName', e.currentTarget.value)}
          />
          <TextInput
            label="Last Name"
            value={formValues.lastName}
            onChange={(e) => handleFormChange('lastName', e.currentTarget.value)}
          />
          <TextInput
            label="Phone Number"
            value={formValues.phoneNumber}
            onChange={(e) => handleFormChange('phoneNumber', e.currentTarget.value)}
          />
          <Select
            label="Company"
            placeholder="Select a company"
            data={companies}
            value={formValues.companyId}
            onChange={(value) => handleFormChange('companyId', value || '')}
          />
          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
