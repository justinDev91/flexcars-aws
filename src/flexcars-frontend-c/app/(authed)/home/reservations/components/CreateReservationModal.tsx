'use client';

import React, { useState } from 'react';
import { Modal, Button, Text, Group, Stack, Select } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useCreateReservation } from '@/app/(authed)/home/reservations/hooks/useCreateReservation';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { Location } from '@/app/types/Reservation';
import { Vehicle } from '@/app/types/Vehicle';

interface CreateReservationModalProps {
  vehicle: Vehicle;
  opened: boolean;
  onClose: () => void;
  estimatedPrice?: number;
}

const CreateReservationModal: React.FC<CreateReservationModalProps> = ({ 
  vehicle, 
  opened, 
  onClose, 
  estimatedPrice = 168 
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [pickupLocation, setPickupLocation] = useState<Location>(Location.SAINT_DENIS);
  const [dropoffLocation, setDropoffLocation] = useState<Location>(Location.ISSY_LES_MOULINEAUX);
  const [carSittingOption, setCarSittingOption] = useState<boolean>(false);
  
  const { user } = useAuthSession();
  const createReservationMutation = useCreateReservation();

  const handleReservation = async () => {
    if (!user?.id) return;

    try {
      createReservationMutation.mutate({
        vehicleId: vehicle.id,
        customerId: user.id,
        startDatetime: startDate.toISOString(),
        endDatetime: endDate.toISOString(),
        pickupLocation,
        dropoffLocation,
        carSittingOption,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create reservation:', error);
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    setPickupLocation(Location.SAINT_DENIS);
    setDropoffLocation(Location.ISSY_LES_MOULINEAUX);
    setCarSittingOption(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const calculateEstimatedCost = () => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const baseCost = estimatedPrice * days;
    const carSittingCost = carSittingOption ? 20 * days : 0;
    return baseCost + carSittingCost;
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <span className="text-xl font-bold text-blue-700 flex items-center gap-2">
          Reserve <span className="text-gray-900">{vehicle.brand} {vehicle.model}</span>
        </span>
      }
      size="lg"
      classNames={{
        body: 'bg-white rounded-xl shadow-lg p-6',
        header: 'border-b border-gray-100',
      }}
      overlayProps={{ className: 'bg-black/30 backdrop-blur-sm' }}
      centered
    >
      <Stack gap="md" className="space-y-4">
        <Group grow className="gap-4">
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
            <DateTimePicker
              className="w-full"
              value={startDate}
              onChange={(value: string | null) => setStartDate(value ? new Date(value) : new Date())}
              minDate={new Date()}
              classNames={{ input: 'w-full border-gray-300 rounded-lg focus:ring-blue-500' }}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
            <DateTimePicker
              className="w-full"
              value={endDate}
              onChange={(value: string | null) => setEndDate(value ? new Date(value) : new Date())}
              minDate={startDate}
              classNames={{ input: 'w-full border-gray-300 rounded-lg focus:ring-blue-500' }}
            />
          </div>
        </Group>

        <Group grow className="gap-4">
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
            <Select
              className="w-full"
              value={pickupLocation}
              onChange={(value) => setPickupLocation(value as Location)}
              data={[
                { value: Location.PARIS_11, label: 'Paris 11' },
                { value: Location.PARIS_19, label: 'Paris 19' },
                { value: Location.ISSY_LES_MOULINEAUX, label: 'Issy-les-Moulineaux' },
                { value: Location.BOULOGNE, label: 'Boulogne' },
                { value: Location.SAINT_DENIS, label: 'Saint-Denis' },
              ]}
              classNames={{ input: 'w-full border-gray-300 rounded-lg focus:ring-blue-500' }}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
            <Select
              className="w-full"
              value={dropoffLocation}
              onChange={(value) => setDropoffLocation(value as Location)}
              data={[
                { value: Location.PARIS_11, label: 'Paris 11' },
                { value: Location.PARIS_19, label: 'Paris 19' },
                { value: Location.ISSY_LES_MOULINEAUX, label: 'Issy-les-Moulineaux' },
                { value: Location.BOULOGNE, label: 'Boulogne' },
                { value: Location.SAINT_DENIS, label: 'Saint-Denis' },
              ]}
              classNames={{ input: 'w-full border-gray-300 rounded-lg focus:ring-blue-500' }}
            />
          </div>
        </Group>

        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="carSitting"
            checked={carSittingOption}
            onChange={(e) => setCarSittingOption(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
          />
          <label htmlFor="carSitting" className="text-sm text-gray-700 select-none">
            Add car sitting service <span className="text-blue-600 font-semibold">(+€20/day)</span>
          </label>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-start mt-2">
          <Text size="sm" className="text-gray-500">Estimated Cost</Text>
          <Text size="xl" fw={600} className="text-blue-700 font-bold">
            €{calculateEstimatedCost()}
          </Text>
          <Text size="xs" className="text-gray-500 mt-1">
            Base: <span className="font-medium">€{estimatedPrice * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}</span>
            {carSittingOption && (
              <span>
                {' + Car sitting: '}<span className="font-medium">€{20 * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}</span>
              </span>
            )}
          </Text>
        </div>

        <Group justify="flex-end" className="mt-4 gap-2">
          <Button variant="outline" onClick={handleClose} className="border-gray-300 text-gray-700 hover:bg-gray-100">
            Cancel
          </Button>
          <Button 
            onClick={handleReservation}
            loading={createReservationMutation.isPending}
            disabled={!user?.id}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
          >
            Confirm Reservation
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CreateReservationModal;
