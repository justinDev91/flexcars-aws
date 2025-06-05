import { IconMapPin } from '@tabler/icons-react';
import { Badge, Group, Paper, Progress, Text, ThemeIcon } from '@mantine/core';
import classes from '../styles/StatsCard.module.css';
import { ReservedCarsCard } from './ReservedCarsCard';

export function LocatedCarsCard() {
  return (
    <Paper radius="md" withBorder className={classes.card}>
      <ThemeIcon className={classes.icon} size={60} radius={60} color="blue">
        <IconMapPin size={32} stroke={1.5} />
      </ThemeIcon>

      <Text ta="center" fw={700} className={classes.title}>
        Located Vehicles
      </Text>
      <Text c="dimmed" ta="center" fz="sm">
        120 / 150 vehicles
      </Text>

      <Group justify="space-between" mt="xs">
        <Text fz="sm" c="dimmed">
          Location Coverage
        </Text>
        <Text fz="sm" c="dimmed">
          80%
        </Text>
      </Group>

      <Progress value={80} mt={5} color="blue" />

      <Group justify="space-between" mt="md">
        <Text fz="sm">120 located</Text>
        <Badge size="sm" color="blue">
          Updated 5 min ago
        </Badge>
      </Group>
      <ReservedCarsCard />
    </Paper>
  );
}
