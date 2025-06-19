'use client';

import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
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

  const handleScan = (result: any) => {
    if (result?.text && !identifier) {
      setIdentifier(result.text);
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
          <QrReader
            constraints={{ facingMode: 'user' }} // Use 'user' for laptop webcam
            onResult={(result, error) => {
              if (result) handleScan(result);
            }}
            containerStyle={{ width: '100%' }}
            videoContainerStyle={{ paddingTop: '100%' }}
            videoStyle={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
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
