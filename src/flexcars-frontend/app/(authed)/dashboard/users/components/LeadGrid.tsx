'use client';

import { Container, SimpleGrid } from '@mantine/core';
import { StatsRingCard } from '../../components/StatsRingCard';
import { SwitchesCard } from '../../components/SwitchesCard';
import { LocatedCarsCard } from '../../components/LocatedCarsCard';

export default function LeadGrid() {
  return (
    <Container fluid px="sm" style={{ backgroundColor: '#f9fafb' }}>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
          <StatsRingCard />
          <SwitchesCard />
          <LocatedCarsCard />
      </SimpleGrid>
    </Container>

  );
}
