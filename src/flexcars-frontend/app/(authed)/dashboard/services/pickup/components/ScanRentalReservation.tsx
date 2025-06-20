'use client';

import { useState } from 'react';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { Loader, Paper, Text, Button, Box } from '@mantine/core';
import { useScanReservation } from '../../../reservations/hooks/useScanReservation';

export default function ScanReservation() {
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const {
    scannedReservation,
    scannedVehicle,
    isScanning,
    error,
    refetch,
  } = useScanReservation(identifier ?? '');


  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes.length) return;

    const rawValue = detectedCodes[0].rawValue;
    console.log('Scanned QR content:', rawValue);

    const idMatch = rawValue.match(/reservationId:\s*(\S+)/);
    if (idMatch && idMatch[1]) {
      const reservationId = idMatch[1].trim();
      if (!identifier) {
        setIdentifier(reservationId);
      }
    }

    const customerMatch = rawValue.match(/customer:\s*'([^']+)'\s*'\s*([^']+)'/);
    if (customerMatch && customerMatch[1] && customerMatch[2]) {
      const fullName = `${customerMatch[1]} ${customerMatch[2]}`;
      setCustomerName(fullName);
    }
  };

  return (
    <>
      {!showScanner ? (
        <Box ta="center" mt="xl">
          <Button onClick={() => setShowScanner(true)}>Démarrer le scan</Button>
        </Box>
      ) : (
        <Box
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 500,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
            border: '4px solid #2c3e50',
          }}
        >
          <Scanner
            onScan={handleScan}
            onError={(err) => console.error('Scan error:', err)}
            constraints={{ facingMode: 'user' }}
            sound={true}
            scanDelay={6000}
            components={{
              finder: true,
              zoom: true,
            }}
            allowMultiple={true}
          />
        </Box>
      )}

      {isScanning && <Loader mt="md" />}

      {error && (
        <Text color="red" mt="md">
          Une erreur est survenue : {error.message}
        </Text>
      )}

      {identifier && customerName && (
        <Paper shadow="xs" p="md" mt="md">
          <Text fw={500}>Réservation trouvée :</Text>
          <Text>Client : {customerName}</Text>
          <Text>Réservation ID : {identifier}</Text>

          {scannedReservation && (
            <>
              <Text>Véhicule : {scannedVehicle?.brand} {scannedVehicle?.model}</Text>
              <Text>Début : {scannedReservation.startDatetime}</Text>
              <Text>Fin : {scannedReservation.endDatetime}</Text>
              <Text>Lieu de prise en charge : {scannedReservation.pickupLocation}</Text>
              <Text>Lieu de retour : {scannedReservation.dropoffLocation}</Text>
              <Button mt="md" onClick={() => refetch()}>
                Rafraîchir
              </Button>
            </>
          )}
        </Paper>
      )}

    </>
  );
}
