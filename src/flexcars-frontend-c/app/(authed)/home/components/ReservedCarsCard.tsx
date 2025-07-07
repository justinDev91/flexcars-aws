import { IconCalendarEvent } from '@tabler/icons-react';
import { Badge, Group, Paper, Progress, Text, ThemeIcon } from '@mantine/core';
import classes from '../styles/StatsCard.module.css';

export function ReservedCarsCard() {
  const totalCars = 150;
  const reservedCars = 65;
  const reservationRate = (reservedCars / totalCars) * 100;

  return (
    <Paper radius="md" withBorder className={classes.card} mt={20}>
      <ThemeIcon className={classes.icon} size={60} radius={60} color="orange">
        <IconCalendarEvent size={32} stroke={1.5} />
      </ThemeIcon>

      <Text ta="center" fw={700} className={classes.title}>
        Reserved Vehicles
      </Text>
      <Text c="dimmed" ta="center" fz="sm">
        {reservedCars} / {totalCars} vehicles
      </Text>

      <Group justify="space-between" mt="xs">
        <Text fz="sm" c="dimmed">
          Reservation Rate
        </Text>
        <Text fz="sm" c="dimmed">
          {reservationRate.toFixed(0)}%
        </Text>
      </Group>

      <Progress value={reservationRate} mt={5} color="orange" />

      <Group justify="space-between" mt="md">
        <Text fz="sm">{reservedCars} booked</Text>
        <Badge size="sm" color="orange">
          Updated just now
        </Badge>
      </Group>
    </Paper>
  );
}
