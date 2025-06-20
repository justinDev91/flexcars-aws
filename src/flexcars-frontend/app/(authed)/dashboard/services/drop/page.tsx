'use client';

import { Container, Divider, Stack, Title, Text, Paper } from '@mantine/core';
import DropVehicleForm from './components/DropVehicleForm';
import DropVehicleWithPayment from './components/DropVehicleWithPayment';

export default function DropPage() {
  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <Paper shadow="xs" p="lg" radius="md" withBorder>
          <Title order={2}>🚗 Drop Vehicle (No Accident)</Title>
          <Text c="dimmed" mb="md">
            Use this form to return a vehicle when there is no accident. If the return is late, a penalty will be calculated automatically.
          </Text>
          <DropVehicleForm />
        </Paper>

        <Divider label="OR" labelPosition="center" />

        <Paper shadow="xs" p="lg" radius="md" withBorder>
          <Title order={2}>🚧 Drop Vehicle with Payment</Title>
          <Text c="dimmed" mb="md">
            Use this form if the vehicle return involves an accident or a late penalty. A payment will be required before completing the drop.
          </Text>
          <DropVehicleWithPayment />
        </Paper>
      </Stack>
    </Container>
  );
}
