'use client';

import { Container, Divider, Stack, Title, Text, Paper } from '@mantine/core';
import DropVehicleWithPayment from './components/DropVehicleWithPayment';

export default function DropPage() {
  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <Divider label="Dropping off rented vehicle" labelPosition="center" />

        <Paper shadow="xs" p="lg" radius="md" withBorder>
          <Title order={2}>🚧 Drop Vehicle</Title>
          <Text c="dimmed" mb="md">
            Use this form to drop off the vehicle if penalty or an accident. A payment will be required before completing the drop.
          </Text>
          <DropVehicleWithPayment />
        </Paper>
      </Stack>
    </Container>
  );
}
