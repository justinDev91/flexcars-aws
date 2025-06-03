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
} from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import {
  IconDots,
  IconMessages,
  IconNote,
  IconPencil,
  IconReportAnalytics,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';

const data = [
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png',
    email: 'rob_wolf@gmail.com',
    firstName: 'Robert',
    lastName: 'Wolfkisser',
    phoneNumber: '+33 6 12 34 56 78',
    birthDate: '1990-04-12',
    company: 'Acme Corp',
    hasReservation: true,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
    email: 'jj@breaker.com',
    firstName: 'Jill',
    lastName: 'Jailbreaker',
    phoneNumber: '+33 6 98 76 54 32',
    birthDate: '1985-09-23',
    company: null,
    hasReservation: false,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
    email: 'henry@silkeater.io',
    firstName: 'Henry',
    lastName: 'Silkeater',
    phoneNumber: '+33 7 45 67 89 01',
    birthDate: '1992-06-15',
    company: 'Globex Inc.',
    hasReservation: true,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
    email: 'alice@codeweaver.dev',
    firstName: 'Alice',
    lastName: 'Codeweaver',
    phoneNumber: '+33 6 11 22 33 44',
    birthDate: '1988-11-30',
    company: 'Initech',
    hasReservation: false,
  },
];

const PAGE_SIZE = 3;

export function UsersStack() {
  const [search, setSearch] = useState('');
  const filteredData = data.filter((user) =>
    [user.firstName, user.lastName, user.email].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pagination = usePagination({ total: totalPages, initialPage: 1 });

  const paginatedData = filteredData.slice(
    (pagination.active - 1) * PAGE_SIZE,
    pagination.active * PAGE_SIZE
  );

  const rows = paginatedData.map((user) => (
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
        <Text fz="xs" c="dimmed">
          Phone
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{user.birthDate || '—'}</Text>
        <Text fz="xs" c="dimmed">
          Birth Date
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{user.company || '—'}</Text>
        <Text fz="xs" c="dimmed">
          Company
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" c={user.hasReservation ? 'green' : 'red'}>
          {user.hasReservation ? 'Actif' : 'Inactif'}
        </Text>
        <Text fz="xs" c="dimmed">
          Reservation
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray">
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
          pagination.setPage(1);
        }}
      />

      <Table.ScrollContainer minWidth={1000}>
        <Table verticalSpacing="md">
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <Pagination
          total={totalPages}
          value={pagination.active}
          onChange={pagination.setPage}
          mt="md"
        />
      )}
    </Stack>
  );
}
