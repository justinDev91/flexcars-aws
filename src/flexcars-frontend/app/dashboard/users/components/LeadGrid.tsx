'use client';

import { Container, Grid, SimpleGrid, rem } from '@mantine/core';
import { StatsRingCard } from '../../components/StatsRingCard';
import { SwitchesCard } from '../../components/SwitchesCard';
import { StatsCard } from '../../components/StatsCard';

export default function LeadGrid() {
  return (
    <Container fluid px="sm" py="sm" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        spacing="sm"
      >
        <StatsRingCard />

        <Grid gutter="sm">
          <Grid.Col span={12}>
            <SwitchesCard />
          </Grid.Col>
          <Grid.Col span={12}>
            <StatsCard />
          </Grid.Col>
        </Grid>
      </SimpleGrid>
    </Container>
  );
}
