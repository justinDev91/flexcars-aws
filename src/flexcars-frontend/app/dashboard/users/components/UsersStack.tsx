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
import { useUpdateUser } from '../hooks/useUpdateuser';

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
  const [editUser, setEditUser] = useState<Omit<User, 'email' | 'birthDate'>| null>(null);
  const [formValues, setFormValues] = useState<Omit<User, 'email' | 'birthDate'>>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyId: '',
    avatar: '',
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);
  const updateUserMutation = useUpdateUser();

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
    const updateUser: Omit<User, 'email' | 'birthDate'> = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      companyId: user.companyId || '',
    };
    setEditUser(updateUser);
    setFormValues(updateUser);
    open();
  };

  const handleFormChange = (field: keyof Omit<User, 'email' | 'birthDate'>, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editUser || !editUser.id) return;
    const {id, ...rest} = formValues;

    updateUserMutation.mutate(
      {
        id: editUser.id,
        data: rest,
      },
      {
        onSuccess: () => {
          console.log('User updated successfully');
          //add mantine appropriate icon or modal to display the message in 5 seconde 
          close();
        },
        onError: (error) => {
          console.error('Error updating user:', error);
        },
      }
    );
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

        <TextInput
          label="Avatar URL"
          placeholder="https://example.com/avatar.jpg"
          value={formValues.avatar}
          onChange={(e) => handleFormChange('avatar', e.currentTarget.value)}
        />

      {/* {editUser?.companyId && (
        <Select
          label="Company"
          placeholder="Select a company"
          data={companies}
          value={formValues.companyId}
          onChange={(value) => handleFormChange('companyId', value || '')}
        />
      )} */}

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
