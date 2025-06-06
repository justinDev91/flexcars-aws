'use client';

import { redirect } from 'next/navigation';
import {
  Container,
  Grid,
  SimpleGrid,
  Loader,
  Badge,
  Group,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { CardWithStats } from '../components/CardWithStats';
import { UserInfoAction } from '../components/UserInfoAction';
import { FeaturesCards } from '../components/FeaturesCards';
import Steppers from '../components/Stepper';
import { useFindUserById } from '../hooks/useFindUserById';

const PRIMARY_COL_HEIGHT = 300;

interface DetailsProps {
  params: { id?: string };
}

export default function Details({ params }: Readonly<DetailsProps>) {
  const userId = useMemo(() => params?.id ?? null, [params]);
  const { user, isUserLoading, isError } = useFindUserById(userId ?? '');

  useEffect(() => {
    if (!params?.id) {
      redirect('/login');
    }
  }, [params]);

  if (isUserLoading) {
    return (
      <Container my="md">
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (isError || !user) {
    return (
      <Container my="md">
        <Group justify="center" mt="xl">
          <Badge color="red" size="lg">
            Failed to load user data
          </Badge>
        </Group>
      </Container>
    );
  }

  return (
    <Container my="md">
      <Group justify="center" my="lg">
        <Badge variant="filled" size="lg">
          User Services Details
        </Badge>
      </Group>

      <Steppers />

      <FeaturesCards />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
        <CardWithStats />
        <Grid gutter="md">
          <Grid.Col>
            <UserInfoAction user={user} />
          </Grid.Col>
        </Grid>
      </SimpleGrid>
    </Container>
  );
}
