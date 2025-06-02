'use client';

import { redirect } from 'next/navigation';
import {
  Container,
  Grid,
  SimpleGrid,
  Skeleton,
  Box,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { CardWithStats } from '../components/CardWithStats';
import { UserInfoAction } from '../components/UserInfoAction';
import { FeaturesCards } from '../components/FeaturesCards';


const PRIMARY_COL_HEIGHT = 300;

export default function Details({
  params,
}: {
  params: { id: string };
}) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      if (!resolved?.id) {
        redirect('/login');
      } else {
        setUserId(resolved.id);
      }
    }
    resolveParams();
  }, [params]);

    return (
    <Container my="md">
      <FeaturesCards />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <CardWithStats />
        <Grid gutter="md">
          <Grid.Col>
            <UserInfoAction />
          </Grid.Col>
        </Grid>
      </SimpleGrid>
    </Container>
  );

}
