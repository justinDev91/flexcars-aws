'use client';

import { IconCar, IconMapPin, IconKey } from '@tabler/icons-react';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text, Stack } from '@mantine/core';
import Link from 'next/link';

const services = [
  {
    label: 'Rental Service',
    description: 'Start a new vehicle rental',
    stats: '456,578',
    progress: 65,
    color: 'teal',
    icon: IconCar,
    link: '/dashboard/services/rental',
  },
  {
    label: 'PickUp Service',
    description: 'Pick up a reserved vehicle',
    stats: '2,550',
    progress: 72,
    color: 'blue',
    icon: IconMapPin,
    link: '/dashboard/services/pickup',
  },
  {
    label: 'DropOff Service',
    description: 'Return a rented vehicle',
    stats: '4,735',
    progress: 52,
    color: 'red',
    icon: IconKey,
    link: '/dashboard/services/dropoff',
  },
] as const;

export default function RentalService() {
  const cards = services.map((service) => {
    const Icon = service.icon;
    return (
      <Link href={service.link} key={service.label} style={{ textDecoration: 'none' }}>
        <Paper withBorder radius="md" p="md" style={{ cursor: 'pointer', transition: '0.2s ease', height: '100%' }}>
          <Group align="flex-start">
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[{ value: service.progress, color: service.color }]}
              label={
                <Center>
                  <Icon size={20} stroke={1.5} />
                </Center>
              }
            />
            <Stack>
              <Text size="md" fw={700}>
                {service.label}
              </Text>
              <Text size="sm" c="dimmed">
                {service.description}
              </Text>
              <Text size="xs" c="gray">
                {service.stats} actions
              </Text>
            </Stack>
          </Group>
        </Paper>
      </Link>
    );
  });

  return <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">{cards}</SimpleGrid>;
}
