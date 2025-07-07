import React, { useState } from 'react';
import { IconGasStation, IconGauge, IconManualGearbox, IconUsers, IconMapPin } from '@tabler/icons-react';
import { Vehicle } from '@/app/types/Vehicle';
import { Badge } from '@mantine/core';
import CreateReservationModal from '@/app/(authed)/home/reservations/components/CreateReservationModal';

interface VehicleCardProps {
  vehicle: Vehicle;
  estimatedPrice?: number;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, estimatedPrice = 168 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    { label: '4 passengers', icon: IconUsers },
    { label: `${vehicle.currentMileage} km`, icon: IconGauge },
    { label: 'Automatic gearbox', icon: IconManualGearbox },
    { label: vehicle.fuelType, icon: IconGasStation },
  ];

  const featuresElements = features.map((feature) => (
    <div key={feature.label} className="flex items-center space-x-2">
      <feature.icon size={16} className="text-gray-600" stroke={1.5} />
      <span className="text-xs text-gray-700">{feature.label}</span>
    </div>
  ));

  const getStatusColor = (status: string) => {
    if (status === 'AVAILABLE') return 'green';
    if (status === 'RESERVED') return 'orange';
    return 'red';
  };

  const statusColor = getStatusColor(vehicle.status);

  return (
    <>
      <div className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="h-56 w-full overflow-hidden">
          <img 
            src={vehicle.imageUrl ?? '/bmw-car.png'} 
            alt={`${vehicle.brand} ${vehicle.model}`} 
            className="h-full w-full object-cover" 
          />
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h3>
              <p className="text-sm text-gray-600">
                Plate: {vehicle.plateNumber} | Fuel: {vehicle.fuelType} | Mileage: {vehicle.currentMileage} km
              </p>
              {vehicle.gpsEnabled && (
                <div className="flex items-center space-x-1 mt-1">
                  <IconMapPin size={14} className="text-green-600" />
                  <span className="text-xs text-green-600">GPS Enabled</span>
                </div>
              )}
            </div>
            <Badge color={statusColor} variant="outline">
              {vehicle.status}
            </Badge>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
            <div className="grid grid-cols-2 gap-2">{featuresElements}</div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-blue-600">€{estimatedPrice}</p>
              <p className="text-sm text-gray-500">per day</p>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={vehicle.status !== 'AVAILABLE'}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                vehicle.status === 'AVAILABLE' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {vehicle.status === 'AVAILABLE' ? 'Reserve now' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>

      <CreateReservationModal
        vehicle={vehicle}
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        estimatedPrice={estimatedPrice}
      />
    </>
  );
};

export default VehicleCard;
