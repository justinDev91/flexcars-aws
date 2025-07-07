import React from 'react';
import { IconGasStation, IconGauge, IconManualGearbox, IconUsers } from '@tabler/icons-react';

const mockdata = [
  { label: '4 passengers', icon: IconUsers },
  { label: '100 km/h in 4 seconds', icon: IconGauge },
  { label: 'Automatic gearbox', icon: IconManualGearbox },
  { label: 'Electric', icon: IconGasStation },
];

interface VehicleCardProps {
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  fuelType: string;
  currentMileage: number;
  gpsEnabled: boolean;
  status: string;
  locationLat: number;
  locationLng: number;
  imageUrl: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  brand,
  model,
  year,
  plateNumber,
  fuelType,
  currentMileage,
  gpsEnabled,
  status,
  imageUrl,
}) => {
  const features = mockdata.map((feature) => (
    <div key={feature.label} className="flex items-center space-x-2">
      <feature.icon size={16} className="text-gray-600" stroke={1.5} />
      <span className="text-xs text-gray-700">{feature.label}</span>
    </div>
  ));

  return (
    <div className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="h-56 w-full overflow-hidden">
        <img src={imageUrl} alt={`${brand} ${model}`} className="h-full w-full object-cover" />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {brand} {model} ({year})
            </h3>
            <p className="text-sm text-gray-600">
              Plate: {plateNumber} | Fuel: {fuelType} | Mileage: {currentMileage} km
            </p>
          </div>
          <span className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded">
            {status}
          </span>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
          <div className="grid grid-cols-2 gap-2">{features}</div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div>
            <p className="text-xl font-bold text-blue-600">$168.00</p>
            <p className="text-sm text-gray-500">per day</p>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            Reserve now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
