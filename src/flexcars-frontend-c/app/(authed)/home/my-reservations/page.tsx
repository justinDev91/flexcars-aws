'use client';

import { useState } from 'react';
import { 
  Container, 
  Title, 
  Card, 
  Text, 
  Badge, 
  Button, 
  Group, 
  Stack, 
  Loader,
  Modal,
  Select,
  Textarea,
  Rating
} from '@mantine/core';
import { useGetAllCustomerReservationByCustomerId } from '@/app/(authed)/home/reservations/hooks/useGetAllCustomerReservationByCustomerId';
import { useGetAllVehicles } from '@/app/(authed)/home/vehicle/hooks/useGetAllVehicles';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { useUpdateReservation } from '@/app/(authed)/home/reservations/hooks/useUpdateReservationVehicle';
import { ReservationStatus, Location } from '@/app/types/Reservation';
import { IconCar, IconCalendar, IconMapPin, IconCreditCard, IconStarFilled } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Payment from '../payment/page';

export default function MyReservations() {
  const { reservations, isReservationsLoading } = useGetAllCustomerReservationByCustomerId();
  const { vehicles } = useGetAllVehicles();
  const { mutate: updateReservation } = useUpdateReservation();
  
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentParams, setPaymentParams] = useState<any>(null);

  const getVehicleDetails = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'yellow';
      case ReservationStatus.CONFIRMED:
        return 'blue';
      case ReservationStatus.COMPLETED:
        return 'green';
      case ReservationStatus.CANCELLED:
        return 'red';
      default:
        return 'gray';
    }
  };

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

  const handleCancelReservation = (reservationId: string) => {
    updateReservation({ 
      id: reservationId, 
      data: { status: ReservationStatus.CANCELLED } 
    });
    notifications.show({
      title: 'Success',
      message: 'Reservation cancelled successfully',
      color: 'green',
    });
  };

  const handleSubmitReview = () => {
    // Here you would typically send the review to your backend
    console.log('Review submitted:', { rating, review, reservation: selectedReservation });
    setIsModalOpen(false);
    setRating(0);
    setReview('');
    notifications.show({
      title: 'Success',
      message: 'Review submitted successfully',
      color: 'green',
    });
  };

  if (isReservationsLoading) {
    return (
      <Container size="lg" py="xl">
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl" className="text-gray-800">
        My Reservations
      </Title>

      {reservations.length === 0 ? (
        <Card padding="xl" className="text-center">
          <IconCar size={48} className="mx-auto mb-4 text-gray-400" />
          <Title order={3} className="text-gray-600 mb-2">
            No reservations yet
          </Title>
          <Text className="text-gray-500 mb-4">
            You haven't made any reservations yet. Start by browsing our available vehicles.
          </Text>
          <Button component="a" href="/home">
            Browse Vehicles
          </Button>
        </Card>
      ) : (
        <Stack gap="md">
          {reservations.map((reservation) => {
            const vehicle = getVehicleDetails(reservation.vehicleId);
            
            return (
              <Card key={reservation.id} padding="lg" shadow="sm" withBorder>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <img
                      src={vehicle?.imageUrl || '/bmw-car.png'}
                      alt={`${vehicle?.brand} ${vehicle?.model}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="md:w-2/3">
                    <Group justify="space-between" mb="md">
                      <div>
                        <Title order={3} className="text-gray-800">
                          {vehicle?.brand} {vehicle?.model} ({vehicle?.year})
                        </Title>
                        <Text size="sm" className="text-gray-600">
                          {vehicle?.plateNumber} • {vehicle?.fuelType}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(reservation.status as ReservationStatus)}>
                        {reservation.status}
                      </Badge>
                    </Group>

                    <Stack gap="xs" mb="md">
                      <Group gap="xs">
                        <IconCalendar size={16} className="text-gray-500" />
                        <Text size="sm">
                          {formatDate(reservation.startDatetime!)} - {formatDate(reservation.endDatetime!)}
                        </Text>
                      </Group>
                      
                      <Group gap="xs">
                        <IconMapPin size={16} className="text-gray-500" />
                        <Text size="sm">
                          {formatLocation(reservation.pickupLocation!)} → {formatLocation(reservation.dropoffLocation!)}
                        </Text>
                      </Group>
                      
                      <Group gap="xs">
                        <IconCreditCard size={16} className="text-gray-500" />
                        <Text size="sm">
                          Total: €{reservation.totalPrice || 0}
                        </Text>
                      </Group>
                    </Stack>

                    <Group gap="xs">
                      {reservation.status === ReservationStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setPaymentParams({
                                reservationId: reservation.id,
                                invoiceId: reservation?.invoice?.id ?? '',
                                amount: reservation.totalPrice,
                                description: 'Car Rental Payment',
                              });
                              setIsPaymentModalOpen(true);
                            }}
                          >
                            Pay Now
                          </Button>
                          <Button
                            variant="outline"
                            color="red"
                            size="sm"
                            onClick={() => handleCancelReservation(reservation.id)}
                          >
                            Cancel Reservation
                          </Button>
                        </>
                      )}
                      
                      {reservation.status === ReservationStatus.CONFIRMED && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/reservations/${reservation.id}/qr`, '_blank')}
                        >
                          View QR Code
                        </Button>
                      )}
                      
                      {reservation.status === ReservationStatus.COMPLETED && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setIsModalOpen(true);
                          }}
                        >
                          <IconStarFilled size={16} className="mr-1" />
                          Rate & Review
                        </Button>
                      )}
                    </Group>
                  </div>
                </div>
              </Card>
            );
          })}
        </Stack>
      )}

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rate Your Experience"
        size="md"
      >
        <Stack gap="md">
          <div>
            <Text size="sm" mb="xs">Rating</Text>
            <Rating value={rating} onChange={setRating} />
          </div>
          
          <Textarea
            label="Review"
            placeholder="Share your experience with this vehicle..."
            value={review}
            onChange={(event) => setReview(event.currentTarget.value)}
            minRows={4}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={rating === 0}>
              Submit Review
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        size="xl"
      >
        <div>
          {paymentParams && (
            <Payment
              reservationId={paymentParams.reservationId}
              invoiceId={paymentParams.invoiceId}
              amount={paymentParams.amount}
              description={paymentParams.description}
              onClose={() => setIsPaymentModalOpen(false)}
            />
          )}
        </div>
      </Modal>
    </Container>
  );
}
