'use client';

import { useState } from 'react';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { Loader, Paper, Text, Button, Box } from '@mantine/core';
import { useScanReservation } from '../../../reservations/hooks/useScanReservation';

export default function ScanReservation() {
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const {
    scannedReservation,
    isScanning,
    error,
    refetch,
  } = useScanReservation(identifier ?? '');

  const handleScan = (detectedCodes:IDetectedBarcode[]) => {
    console.log('result', detectedCodes)
    // if (text && !identifier) {
    //   setIdentifier(text);
    // }
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
            onScan={(detectedCodes:IDetectedBarcode[]) => handleScan(detectedCodes)}
            onError={(err) => console.error('Scan error:', err)}
            constraints={{ facingMode: 'user' }}
            sound = {true}
            scanDelay = {6000}
            components = {
              {
               finder: true,
               zoom: true
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

      {scannedReservation && (
        <Paper shadow="xs" p="md" mt="md">
          <Text fw={500}>Réservation trouvée :</Text>
          <Text>Client : {scannedReservation.customerId}</Text>
          <Text>Véhicule : {scannedReservation.vehicleId}</Text>
          <Text>Pickup Location : {scannedReservation.pickupLocation}</Text>
          <Button mt="md" onClick={() => refetch()}>
            Rafraîchir
          </Button>
        </Paper>
      )}
    </>
  );
}
