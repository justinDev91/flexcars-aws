'use client';

import { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { Container, Title, TextInput, ActionIcon, useMantineTheme } from '@mantine/core';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import VehicleCard from '@/app/(authed)/home/components/VehicleCard';
import { useGetAllVehicles } from '@/app/(authed)/home/vehicle/hooks/useGetAllVehicles';
import Link from 'next/link';

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

export default function VehicleStack() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFuelType, setFilterFuelType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 1000]);
  const [filterTransmission, setFilterTransmission] = useState<string>('');
  const [filterSeatingCapacity, setFilterSeatingCapacity] = useState<string>('');
  const [filterVehicleType, setFilterVehicleType] = useState<string>('');
  const [filterMileageRange, setFilterMileageRange] = useState<[number, number]>([0, 200000]);

  const { vehicles, isVehiclesLoading } = useGetAllVehicles();

  const filteredVehicles = useMemo(() => {
    if (isVehiclesLoading) {
      return [];
    }

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
        (!searchQuery ||
          vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase()))
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
    isVehiclesLoading,
  ]);

  const handleSelectChange = (setter: Dispatch<SetStateAction<string>>) => {
    return (value: string | null) => {
      setter(value || '');
    };
  };

  return (
    <Container fluid className="p-6">
      <div className="flex flex-col items-center mb-8">
        <InputWithButton
          value={searchQuery}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.currentTarget.value)}
          className="w-full max-w-lg"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Section */}
        <aside className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6 md:mb-0 flex flex-col gap-6 sticky top-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 tracking-tight">Filters</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterFuelType}
                onChange={e => setFilterFuelType(e.target.value)}
              >
                <option value="">All</option>
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="RENTED">Rented</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
              >
                <option value="">All</option>
                <option value="PARIS_11">Paris 11</option>
                <option value="PARIS_19">Paris 19</option>
                <option value="ISSY_LES_MOULINEAUX">Issy-les-Moulineaux</option>
                <option value="BOULOGNE">Boulogne</option>
                <option value="SAINT_DENIS">Saint-Denis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterTransmission}
                onChange={e => setFilterTransmission(e.target.value)}
              >
                <option value="">All</option>
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterSeatingCapacity}
                onChange={e => setFilterSeatingCapacity(e.target.value)}
              >
                <option value="">All</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterVehicleType}
                onChange={e => setFilterVehicleType(e.target.value)}
              >
                <option value="">All</option>
                <option value="SUV">SUV</option>
                <option value="SEDAN">Sedan</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (€)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filterPriceRange[0]}
                  onChange={e => setFilterPriceRange([parseInt(e.target.value), filterPriceRange[1]])}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filterPriceRange[1]}
                  onChange={e => setFilterPriceRange([filterPriceRange[0], parseInt(e.target.value)])}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={filterPriceRange[0]}
                onChange={e => setFilterPriceRange([parseInt(e.target.value), filterPriceRange[1]])}
                className="w-full mt-2 accent-blue-500"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={filterPriceRange[1]}
                onChange={e => setFilterPriceRange([filterPriceRange[0], parseInt(e.target.value)])}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>€{filterPriceRange[0]}</span>
                <span>€{filterPriceRange[1]}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage Range (km)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="200000"
                  value={filterMileageRange[0]}
                  onChange={e => setFilterMileageRange([parseInt(e.target.value), filterMileageRange[1]])}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min="0"
                  max="200000"
                  value={filterMileageRange[1]}
                  onChange={e => setFilterMileageRange([filterMileageRange[0], parseInt(e.target.value)])}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                value={filterMileageRange[0]}
                onChange={e => setFilterMileageRange([parseInt(e.target.value), filterMileageRange[1]])}
                className="w-full mt-2 accent-blue-500"
              />
              <input
                type="range"
                min="0"
                max="200000"
                value={filterMileageRange[1]}
                onChange={e => setFilterMileageRange([filterMileageRange[0], parseInt(e.target.value)])}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{filterMileageRange[0]} km</span>
                <span>{filterMileageRange[1]} km</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Vehicle Grid Section */}
        <div className="flex-1">
          <Title order={3} className="mb-6 text-gray-700">
            Available Vehicles
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle, index) => (
                <div key={index} className="flex justify-center">
                  <Link href={`/home/vehicle/${vehicle.id}`} className="w-full">
                    <VehicleCard vehicle={vehicle} />
                  </Link>
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
