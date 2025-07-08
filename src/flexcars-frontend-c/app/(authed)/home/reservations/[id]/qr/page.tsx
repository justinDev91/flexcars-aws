'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Card, 
  Text, 
  Button, 
  Group, 
  Stack, 
  Loader,
  Alert,
  Badge
} from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useGetReservationById } from '@/app/(authed)/home/reservations/hooks/useGetReservationById';
import { useGetAllVehicles } from '@/app/(authed)/home/vehicle/hooks/useGetAllVehicles';
import { IconDownload, IconPrint, IconArrowLeft, IconQrcode } from '@tabler/icons-react';
import QRCode from 'qrcode';
import { ReservationStatus, Location } from '@/app/types/Reservation';

export default function ReservationQR() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  
  const { reservation, isLoading } = useGetReservationById(reservationId);
  const { vehicles } = useGetAllVehicles();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (reservation) {
      const qrData = JSON.stringify({
        reservationId: reservation.id,
        customerId: reservation.customerId,
        vehicleId: reservation.vehicleId,
        startDate: reservation.startDatetime,
        endDate: reservation.endDatetime,
        pickupLocation: reservation.pickupLocation,
        dropoffLocation: reservation.dropoffLocation,
      });

      QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
    }
  }, [reservation]);

  const vehicle = vehicles.find(v => v.id === reservation?.vehicleId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLocation = (location: Location) => {
    return location.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDownload = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `reservation-qr-${reservationId}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrCodeDataUrl) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Reservation QR Code</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px 0; }
              .details { margin: 20px 0; text-align: left; }
            </style>
          </head>
          <body>
            <h1>FlexCars Reservation</h1>
            <div class="qr-container">
              <img src="${qrCodeDataUrl}" alt="QR Code" />
            </div>
            <div class="details">
              <h3>Reservation Details</h3>
              <p><strong>Vehicle:</strong> ${vehicle?.brand} ${vehicle?.model} (${vehicle?.plateNumber})</p>
              <p><strong>Pickup:</strong> ${formatDate(reservation?.startDatetime || '')} at ${formatLocation(reservation?.pickupLocation!)}</p>
              <p><strong>Return:</strong> ${formatDate(reservation?.endDatetime || '')} at ${formatLocation(reservation?.dropoffLocation!)}</p>
              <p><strong>Total:</strong> €${reservation?.totalPrice}</p>
            </div>
            <p><em>Present this QR code at pickup location</em></p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  if (!reservation) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" title="Reservation Not Found">
          The requested reservation could not be found.
        </Alert>
      </Container>
    );
  }

  if (reservation.status !== ReservationStatus.CONFIRMED) {
    return (
      <Container size="sm" py="xl">
        <Alert color="yellow" title="QR Code Not Available">
          QR codes are only available for confirmed reservations.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Group mb="xl">
        <Button
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Title order={2} className="flex-1 text-center">
          Reservation QR Code
        </Title>
      </Group>

      <Card withBorder className="text-center">
        <Stack gap="md">
          <div className="mx-auto">
            <IconQrcode size={48} className="text-blue-600 mb-4" />
            <Title order={3} mb="md">
              Your Pickup QR Code
            </Title>
          </div>

          {qrCodeDataUrl && (
            <div className="flex justify-center">
              <img 
                src={qrCodeDataUrl} 
                alt="Reservation QR Code"
                className="border rounded-lg shadow-sm"
              />
            </div>
          )}

          <Alert color="blue" variant="light">
            <Text size="sm">
              Present this QR code at the pickup location to quickly access your reserved vehicle.
            </Text>
          </Alert>

          <Card withBorder bg="gray.0">
            <Title order={4} mb="sm">Reservation Details</Title>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Vehicle:</Text>
                <Text size="sm">{vehicle?.brand} {vehicle?.model}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Plate Number:</Text>
                <Text size="sm">{vehicle?.plateNumber}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Pickup:</Text>
                <Text size="sm">{formatDate(reservation.startDatetime!)} at {formatLocation(reservation.pickupLocation!)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Return:</Text>
                <Text size="sm">{formatDate(reservation.endDatetime!)} at {formatLocation(reservation.dropoffLocation!)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Total Cost:</Text>
                <Text size="sm" fw={700}>€{reservation.totalPrice}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Status:</Text>
                <Badge color="green">{reservation.status}</Badge>
              </Group>
            </Stack>
          </Card>

          <Group justify="center" gap="sm">
            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              variant="outline"
              leftSection={<IconPrint size={16} />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Group>

          <Text size="xs" c="dimmed" ta="center">
            This QR code is valid for your reservation period only.
            <br />
            Keep it secure and don't share with others.
          </Text>
        </Stack>
      </Card>
    </Container>
  );
}
