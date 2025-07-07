'use client';

import { useState } from 'react';
import { Container, Title, Space, Button, Select, Grid, TextInput, ActionIcon, useMantineTheme } from '@mantine/core';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import VehicleCard from '@/app/(authed)/home/components/VehicleCard';

function InputWithButton(props) {
  const theme = useMantineTheme();

  return (
    <TextInput
      radius="xl"
      size="md"
      placeholder="Search for a vehicle or service"
      rightSectionWidth={42}
      leftSection={<IconSearch size={18} stroke={1.5} />}
      rightSection={
        <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled">
          <IconArrowRight size={18} stroke={1.5} />
        </ActionIcon>
      }
      {...props}
    />
  );
}

export default function ReservationHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');

  const handleSearch = () => {
    console.log('Search query:', searchQuery, 'Filter:', filter);
  };

  const vehicles = [
    {
      brand: 'Tesla',
      model: 'Model S',
      year: 2022,
      plateNumber: 'ABC123',
      fuelType: 'Electric',
      currentMileage: 15000,
      gpsEnabled: true,
      status: 'Available',
      locationLat: 37.7749,
      locationLng: -122.4194,
      imageUrl: 'https://i.imgur.com/ZL52Q2D.png',
    },
    {
      brand: 'BMW',
      model: 'X5',
      year: 2021,
      plateNumber: 'XYZ789',
      fuelType: 'Diesel',
      currentMileage: 30000,
      gpsEnabled: false,
      status: 'Unavailable',
      locationLat: 40.7128,
      locationLng: -74.0060,
      imageUrl: 'https://i.imgur.com/ZL52Q2D.png',
    },
    {
      brand: 'BMW',
      model: 'X5',
      year: 2021,
      plateNumber: 'XYZ789',
      fuelType: 'Diesel',
      currentMileage: 30000,
      gpsEnabled: false,
      status: 'Unavailable',
      locationLat: 40.7128,
      locationLng: -74.0060,
      imageUrl: 'https://i.imgur.com/ZL52Q2D.png',
    },
  ];

  return (
    <Container fluid>
      <Title order={2} mb="md">
        Make a Reservation
      </Title>

      <Grid>
        <Grid.Col span={12} md={8}>
          <InputWithButton
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={12} md={4}>
          <Select
            placeholder="Filter by category"
            data={['Cars', 'Services', 'Locations']}
            value={filter}
            onChange={setFilter}
            size="md"
          />
        </Grid.Col>
      </Grid>

      <Space h="md" />

      <Button onClick={handleSearch} size="md">
        Search
      </Button>

      <Space h="xl" />

      <Title order={3} mb="md">
        Available Vehicles
      </Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {vehicles.map((vehicle, index) => (
          <div key={index} className="flex justify-center">
            <VehicleCard {...vehicle} />
          </div>
        ))}
      </div>
    </Container>
  );
}
