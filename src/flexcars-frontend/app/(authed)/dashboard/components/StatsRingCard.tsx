import { Card, Group, RingProgress, Text, useMantineTheme } from '@mantine/core';
import classes from '../styles/StatsRingCard.module.css';

const stats = [
  { value: 320, label: 'Parked' },
  { value: 180, label: 'In transit' },
  { value: 150, label: 'Delivered' },
];

export function StatsRingCard() {
  const theme = useMantineTheme();
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);
  const completed = stats.find((s) => s.label === 'Delivered')?.value ?? 0;

  const items = stats.map((stat) => (
    <div key={stat.label}>
      <Text className={classes.label}>{stat.value}</Text>
      <Text size="xs" c="dimmed">
        {stat.label}
      </Text>
    </div>
  ));

  return (
    <Card withBorder p="xl" radius="md" className={classes.card}>
      <div className={classes.inner}>
        <div>
          <Text fz="xl" className={classes.label}>
            Car Locations
          </Text>
          <div>
            <Text className={classes.lead} mt={30}>
              {completed}
            </Text>
            <Text fz="xs" c="dimmed">
              Delivered
            </Text>
          </div>
          <Group mt="lg">{items}</Group>
        </div>

        <div className={classes.ring}>
          <RingProgress
            roundCaps
            thickness={6}
            size={150}
            sections={[{ value: (completed / total) * 100, color: theme.primaryColor }]}
            label={
              <div>
                <Text ta="center" fz="lg" className={classes.label}>
                  {((completed / total) * 100).toFixed(0)}%
                </Text>
                <Text ta="center" fz="xs" c="dimmed">
                  Delivered
                </Text>
              </div>
            }
          />
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">Live vehicle tracking updates...</div>
    </Card>
  );
}
