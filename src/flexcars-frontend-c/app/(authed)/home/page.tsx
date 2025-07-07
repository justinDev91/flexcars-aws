'use client';

import { useState, useMemo } from 'react';
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
  const [filterFuelType, setFilterFuelType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState([0, 1000]);
  const [filterTransmission, setFilterTransmission] = useState('');
  const [filterSeatingCapacity, setFilterSeatingCapacity] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [filterMileageRange, setFilterMileageRange] = useState([0, 200000]);

  const vehicles = [
    {
      brand: 'Tesla',
      model: 'Model S',
      year: 2022,
      plateNumber: 'ABC123',
      fuelType: 'ELECTRIC',
      currentMileage: 15000,
      gpsEnabled: true,
      status: 'AVAILABLE',
      locationLat: 37.7749,
      locationLng: -122.4194,
      imageUrl: 'https://i.imgur.com/ZL52Q2D.png',
      location: 'PARIS_11',
      transmission: 'AUTOMATIC',
      seatingCapacity: 5,
      type: 'SEDAN',
      price: 80000,
    },
    {
      brand: 'BMW',
      model: 'X5',
      year: 2021,
      plateNumber: 'XYZ789',
      fuelType: 'DIESEL',
      currentMileage: 30000,
      gpsEnabled: false,
      status: 'RESERVED',
      locationLat: 40.7128,
      locationLng: -74.0060,
      imageUrl: 'https://i.imgur.com/ZL52Q2D.png',
      location: 'PARIS_19',
      transmission: 'MANUAL',
      seatingCapacity: 7,
      type: 'SUV',
      price: 60000,
    },
     {
      brand: 'BMW',
      model: 'X5',
      year: 2021,
      plateNumber: 'XYZ789',
      fuelType: 'DIESEL',
      currentMileage: 30000,
      gpsEnabled: false,
      status: 'RESERVED',
      locationLat: 40.7128,
      locationLng: -74.0060,
      imageUrl: 'https://i.imgur.com/ZL52Q2D.png',
      location: 'PARIS_19',
      transmission: 'MANUAL',
      seatingCapacity: 7,
      type: 'SUV',
      price: 60000,
    },
  ];

  const filteredVehicles = useMemo(() => {
    const noFiltersActive =
      !searchQuery &&
      !filterFuelType &&
      !filterStatus &&
      !filterLocation &&
      !filterTransmission &&
      !filterSeatingCapacity &&
      !filterVehicleType &&
      filterPriceRange[0] === 0 &&
      filterPriceRange[1] === 1000 &&
      filterMileageRange[0] === 0 &&
      filterMileageRange[1] === 200000;

    if (noFiltersActive) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      return (
        (!filterFuelType || vehicle.fuelType === filterFuelType) &&
        (!filterStatus || vehicle.status === filterStatus) &&
        (!filterLocation || vehicle.location === filterLocation) &&
        (!filterTransmission || vehicle.transmission === filterTransmission) &&
        (!filterSeatingCapacity || vehicle.seatingCapacity === parseInt(filterSeatingCapacity)) &&
        (!filterVehicleType || vehicle.type === filterVehicleType) &&
        (vehicle.price >= filterPriceRange[0] && vehicle.price <= filterPriceRange[1]) &&
        (vehicle.currentMileage >= filterMileageRange[0] && vehicle.currentMileage <= filterMileageRange[1]) &&
        (!searchQuery ||
          vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [
    searchQuery,
    filterFuelType,
    filterStatus,
    filterLocation,
    filterTransmission,
    filterSeatingCapacity,
    filterVehicleType,
    filterPriceRange,
    filterMileageRange,
    vehicles,
  ]);

  return (
    <Container fluid className="p-6">
      <div className="flex flex-col items-center mb-8">
        <InputWithButton
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          className="w-full max-w-lg"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Section */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <Title order={4} className="mb-4 text-gray-700">
            Filters
          </Title>
          <Select
            placeholder="Fuel Type"
            data={['', 'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']}
            value={filterFuelType}
            onChange={setFilterFuelType}
            size="md"
            className="mb-4"
          />
          <Select
            placeholder="Status"
            data={['', 'AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE']}
            value={filterStatus}
            onChange={setFilterStatus}
            size="md"
            className="mb-4"
          />
          <Select
            placeholder="Location"
            data={['', 'PARIS_11', 'PARIS_19', 'ISSY_LES_MOULINEAUX', 'BOULOGNE', 'SAINT_DENIS']}
            value={filterLocation}
            onChange={setFilterLocation}
            size="md"
            className="mb-4"
          />
          <Select
            placeholder="Transmission"
            data={['', 'AUTOMATIC', 'MANUAL']}
            value={filterTransmission}
            onChange={setFilterTransmission}
            size="md"
            className="mb-4"
          />
          <Select
            placeholder="Seating Capacity"
            data={['', '2', '4', '5', '7', '8']}
            value={filterSeatingCapacity}
            onChange={setFilterSeatingCapacity}
            size="md"
            className="mb-4"
          />
          <Select
            placeholder="Vehicle Type"
            data={['', 'SUV', 'SEDAN', 'HATCHBACK', 'TRUCK']}
            value={filterVehicleType}
            onChange={setFilterVehicleType}
            size="md"
            className="mb-4"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              value={filterPriceRange[0]}
              onChange={(e) => setFilterPriceRange([parseInt(e.target.value), filterPriceRange[1]])}
              className="w-full mb-2"
            />
            <input
              type="range"
              min="0"
              max="1000"
              value={filterPriceRange[1]}
              onChange={(e) => setFilterPriceRange([filterPriceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${filterPriceRange[0]}</span>
              <span>${filterPriceRange[1]}</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mileage Range
            </label>
            <input
              type="range"
              min="0"
              max="200000"
              value={filterMileageRange[0]}
              onChange={(e) => setFilterMileageRange([parseInt(e.target.value), filterMileageRange[1]])}
              className="w-full mb-2"
            />
            <input
              type="range"
              min="0"
              max="200000"
              value={filterMileageRange[1]}
              onChange={(e) => setFilterMileageRange([filterMileageRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filterMileageRange[0]} km</span>
              <span>{filterMileageRange[1]} km</span>
            </div>
          </div>
        </div>

        {/* Vehicle Grid Section */}
        <div className="flex-1">
          <Title order={3} className="mb-6 text-gray-700">
            Available Vehicles
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle, index) => (
                <div key={index} className="flex justify-center">
                  <VehicleCard {...vehicle} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No vehicles available matching the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
