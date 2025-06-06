'use client';

import {
  IconCalendarEvent,
  IconFileText,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  useMantineTheme,
} from '@mantine/core';
import classes from '../../styles/FeaturesCards.module.css';

const mockdata = [
  {
    title: 'Reservations',
    count: 30,
    description:
      'View and manage all your current and past reservations, including upcoming bookings and cancellations.',
    icon: IconCalendarEvent,
  },
  {
    title: 'Contracts',
    count: 12,
    description:
      'Access your active and archived contracts, review terms, and download official documents.',
    icon: IconFileText,
  },
  {
    title: 'Incidents',
    count: 5,
    description:
      'Report and track incidents related to your account or services. Stay informed on resolution progress.',
    icon: IconAlertTriangle,
  },
];

export function FeaturesCards() {
  const theme = useMantineTheme();
  const features = mockdata.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon size={50} stroke={1.5} color={theme.colors.blue[6]} />
      <Group justify="space-between" mt="md">
        <Text fz="lg" fw={500} className={classes.cardTitle}>
          {feature.title}
        </Text>
        <Badge color="blue" variant="light" size="lg">
          {feature.count}
        </Badge>
      </Group>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" pb="xl">
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}
