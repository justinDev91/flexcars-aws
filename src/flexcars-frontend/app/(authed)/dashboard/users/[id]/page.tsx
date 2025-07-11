'use client';

import { redirect, useParams } from 'next/navigation';
import {
  Container,
  Grid,
  SimpleGrid,
  Loader,
  Badge,
  Group,
} from '@mantine/core';
import { useEffect } from 'react';
import { CardWithStats } from '../components/CardWithStats';
import { UserInfoAction } from '../components/UserInfoAction';
import { FeaturesCards } from '../components/FeaturesCards';
import Steppers from '../components/Stepper';
import { useFindUserById } from '../hooks/useFindUserById';

const PRIMARY_COL_HEIGHT = 300;

export default function Details() {
  const params = useParams<{ id: string}>()
  
  const { user, isUserLoading, isError } = useFindUserById(params.id ?? '');

  useEffect(() => {
    if (!params.id) {
      redirect('/auth/login');
    }
  }, [params.id]);

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
