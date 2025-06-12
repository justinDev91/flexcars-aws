import { Card, Group, Switch, Text } from '@mantine/core';
import classes from '../styles/SwitchesCard.module.css';

const data = [
  { title: 'Location updates', description: 'Receive real-time updates when a car changes location' },
  { title: 'Maintenance alerts', description: 'Be notified when a vehicle is due for service or inspection' },
  { title: 'Speeding alerts', description: 'Get alerts when a driver exceeds speed limits' },
  {
    title: 'Idle time warnings',
    description: 'Receive notifications when a vehicle remains idle for too long',
  },
];

export function SwitchesCard() {
  const items = data.map((item) => (
    <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl" key={item.title}>
      <div>
        <Text>{item.title}</Text>
        <Text size="xs" c="dimmed">
          {item.description}
        </Text>
      </div>
      <Switch onLabel="ON" offLabel="OFF" className={classes.switch} size="lg" />
    </Group>
  ));

  return (
    <Card withBorder radius="md" p="xl" className={classes.card}>
      <Text fz="lg" className={classes.title} fw={500}>
        Vehicle Notification Settings
      </Text>
      <Text fz="xs" c="dimmed" mt={3} mb="xl">
        Choose which vehicle alerts you want to receive
      </Text>
      {items}
    </Card>
  );
}
