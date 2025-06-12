'use client';

import { Card, Group, Image, RingProgress, Text } from '@mantine/core';
import classes from '../../styles/CardWithStats.module.css';

const stats = [
  { title: 'Total Rentals', value: '124' },
  { title: 'Avg. Rental Duration', value: '3.5 days' },
  { title: 'Customer Rating', value: '4.7 / 5' },
];

export function CardWithStats() {
  const items = stats.map((stat) => (
    <div key={stat.title}>
      <Text size="xs" color="dimmed">
        {stat.title}
      </Text>
      <Text fw={500} size="sm">
        {stat.value}
      </Text>
    </div>
  ));

  return (
    <Card withBorder padding="lg" radius="md" className={classes.card}>
      <Card.Section>
        <Image
          src="/bmw-car.png"
          alt="Car rental overview"
          height={100}
        />
      </Card.Section>

      <Group justify="space-between" mt="lg">
        <Text className={classes.title}>Car Rental Overview</Text>
        <Group gap={5}>
          <Text fz="xs" c="dimmed">
            75% fleet utilization
          </Text>
          <RingProgress size={18} thickness={2} sections={[{ value: 75, color: 'blue' }]} />
        </Group>
      </Group>

      <Text mt="sm" mb="md" c="dimmed" fz="xs">
        124 rentals this month • 12% increase from last month • 98% satisfaction rate
      </Text>

      <Card.Section className={classes.footer}>{items}</Card.Section>
    </Card>
  );
}
