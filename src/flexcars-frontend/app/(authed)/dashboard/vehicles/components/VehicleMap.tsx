'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VehicleMapProps {
  latitude: number;
  longitude: number;
}

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function VehicleMap({ latitude, longitude }: Readonly<VehicleMapProps>) {
  return (
    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={icon}>
        <Popup>Véhicule ici</Popup>
      </Marker>
    </MapContainer>
  );
}
