'use client';

import { Title, Space, Container } from '@mantine/core';
import { StatsGroup } from './components/StatsGroup';
import { StatsRing } from './components/StatsRing';
import { StatsControls } from './components/StatsControls';
import StatsGrid from './components/statsGrid';

export default function Dashboard() {
  return (
    <Container fluid>
      <Title order={2} mb="md">
        Dashboard Overview
      </Title>

      <StatsGrid />
      <Space h="xl" />

      <StatsRing />
      <Space h="xl" />

      <StatsControls />
       <Space h="xl" />

      <StatsGroup />
      <Space h="xl" />
    </Container>
  );
}
