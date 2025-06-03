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
    name: 'Robert Wolfkisser',
    job: 'Engineer',
    email: 'rob_wolf@gmail.com',
    rate: 22,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
    name: 'Jill Jailbreaker',
    job: 'Engineer',
    email: 'jj@breaker.com',
    rate: 45,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
    name: 'Henry Silkeater',
    job: 'Designer',
    email: 'henry@silkeater.io',
    rate: 76,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
    name: 'Bill Horsefighter',
    job: 'Designer',
    email: 'bhorsefighter@gmail.com',
    rate: 15,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
    name: 'Jeremy Footviewer',
    job: 'Manager',
    email: 'jeremy@foot.dev',
    rate: 98,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-4.png',
    name: 'Alice Codeweaver',
    job: 'Developer',
    email: 'alice@codeweaver.dev',
    rate: 60,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-6.png',
    name: 'Tom Ironbuilder',
    job: 'Architect',
    email: 'tom@ironbuilder.com',
    rate: 85,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-7.png',
    name: 'Nina Pixelcrafter',
    job: 'UI/UX Designer',
    email: 'nina@pixelcraft.io',
    rate: 70,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png',
    name: 'Carlos Datahunter',
    job: 'Data Scientist',
    email: 'carlos@datahunter.ai',
    rate: 110,
  },
  {
    avatar: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png',
    name: 'Lena Cloudwalker',
    job: 'DevOps Engineer',
    email: 'lena@cloudwalker.dev',
    rate: 95,
  },
];

const PAGE_SIZE = 3;

export function UsersStack() {
  const [search, setSearch] = useState('');
  const filteredData = data.filter((item) =>
    [item.name, item.job, item.email].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pagination = usePagination({ total: totalPages, initialPage: 1 });

  const paginatedData = filteredData.slice(
    (pagination.active - 1) * PAGE_SIZE,
    pagination.active * PAGE_SIZE
  );

  const rows = paginatedData.map((item) => (
    <Table.Tr key={item.name}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={40} src={item.avatar} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
            <Text c="dimmed" fz="xs">
              {item.job}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{item.email}</Text>
        <Text fz="xs" c="dimmed">
          Email
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">${item.rate.toFixed(1)} / hr</Text>
        <Text fz="xs" c="dimmed">
          Rate
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
              <Menu.Item leftSection={<IconMessages size={16} stroke={1.5} />}>
                Send message
              </Menu.Item>
              <Menu.Item leftSection={<IconNote size={16} stroke={1.5} />}>
                Add note
              </Menu.Item>
              <Menu.Item leftSection={<IconReportAnalytics size={16} stroke={1.5} />}>
                Analytics
              </Menu.Item>
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
        placeholder="Search by name, job, or email"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          pagination.setPage(1);
        }}
      />

      <Table.ScrollContainer minWidth={800}>
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
