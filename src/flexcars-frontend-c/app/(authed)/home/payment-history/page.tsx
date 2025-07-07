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
  ActionIcon,
  Pagination,
  Select,
  TextInput
} from '@mantine/core';
import { useGetAllReservation } from '@/app/(authed)/home/reservations/hooks/useGetAllReservation';
import { useGetAllVehicles } from '@/app/(authed)/home/vehicle/hooks/useGetAllVehicles';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { ReservationStatus } from '@/app/types/Reservation';
import { IconCreditCard, IconDownload, IconEye, IconReceipt, IconSearch, IconFilter } from '@tabler/icons-react';
import { useMemo } from 'react';

interface PaymentHistory {
  id: string;
  reservationId: string;
  vehicleInfo: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
  method: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER';
  invoiceId?: string;
}

export default function PaymentHistory() {
  const { user } = useAuthSession();
  const { reservations, isReservationsLoading } = useGetAllReservation();
  const { vehicles } = useGetAllVehicles();
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');

  // Filter reservations for the current user and create payment history
  const paymentHistory = useMemo(() => {
    const userReservations = reservations.filter(r => r.customerId === user?.id);
    
    return userReservations.map(reservation => {
      const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
      
      return {
        id: `payment-${reservation.id}`,
        reservationId: reservation.id,
        vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})` : 'Unknown Vehicle',
        amount: reservation.totalPrice || 0,
        status: reservation.status === ReservationStatus.COMPLETED ? 'PAID' : 
                reservation.status === ReservationStatus.CONFIRMED ? 'PAID' : 'PENDING',
        date: reservation.startDatetime || new Date().toISOString(),
        method: 'STRIPE' as const,
        invoiceId: `INV-${reservation.id.slice(-6).toUpperCase()}`,
      };
    });
  }, [reservations, vehicles, user]);

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    return paymentHistory.filter(payment => {
      const matchesSearch = searchQuery === '' || 
        payment.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === '' || payment.status === statusFilter;
      const matchesMethod = methodFilter === '' || payment.method === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [paymentHistory, searchQuery, statusFilter, methodFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'OVERDUE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'STRIPE':
        return '💳';
      case 'PAYPAL':
        return '💰';
      case 'BANK_TRANSFER':
        return '🏦';
      default:
        return '💳';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownloadInvoice = (payment: PaymentHistory) => {
    // Simulate PDF download
    const element = document.createElement('a');
    const file = new Blob([`Invoice for ${payment.vehicleInfo} - €${payment.amount}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `invoice-${payment.invoiceId}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const calculateTotalSpent = () => {
    return paymentHistory
      .filter(p => p.status === 'PAID')
      .reduce((sum, payment) => sum + payment.amount, 0);
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
        Payment History
      </Title>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card padding="lg" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Total Spent</Text>
              <Text size="xl" fw={700} c="green">€{calculateTotalSpent()}</Text>
            </div>
            <IconCreditCard size={24} className="text-green-500" />
          </Group>
        </Card>

        <Card padding="lg" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Total Transactions</Text>
              <Text size="xl" fw={700}>{paymentHistory.length}</Text>
            </div>
            <IconReceipt size={24} className="text-blue-500" />
          </Group>
        </Card>

        <Card padding="lg" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Pending Payments</Text>
              <Text size="xl" fw={700} c="orange">
                {paymentHistory.filter(p => p.status === 'PENDING').length}
              </Text>
            </div>
            <IconCreditCard size={24} className="text-orange-500" />
          </Group>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="md" mb="md" withBorder>
        <Group grow>
          <TextInput
            placeholder="Search by vehicle or invoice..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
          <Select
            placeholder="Filter by status"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: '', label: 'All Status' },
              { value: 'PAID', label: 'Paid' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'OVERDUE', label: 'Overdue' },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || '')}
          />
          <Select
            placeholder="Filter by method"
            data={[
              { value: '', label: 'All Methods' },
              { value: 'STRIPE', label: 'Credit Card' },
              { value: 'PAYPAL', label: 'PayPal' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
            ]}
            value={methodFilter}
            onChange={(value) => setMethodFilter(value || '')}
          />
        </Group>
      </Card>

      {/* Payments Table */}
      {paginatedPayments.length === 0 ? (
        <Card padding="xl" className="text-center">
          <IconCreditCard size={48} className="mx-auto mb-4 text-gray-400" />
          <Title order={3} className="text-gray-600 mb-2">
            No payment history
          </Title>
          <Text className="text-gray-500 mb-4">
            You haven't made any payments yet. Start by making a reservation.
          </Text>
          <Button component="a" href="/browse-vehicles">
            Browse Vehicles
          </Button>
        </Card>
      ) : (
        <Stack gap="xs">
          {paginatedPayments.map((payment) => (
            <Card key={payment.id} padding="md" withBorder>
              <Group justify="space-between">
                <div className="flex-1">
                  <Group gap="sm">
                    <span className="text-lg">{getMethodIcon(payment.method)}</span>
                    <div>
                      <Text fw={500}>{payment.vehicleInfo}</Text>
                      <Text size="sm" c="dimmed">
                        {formatDate(payment.date)} • Invoice: {payment.invoiceId}
                      </Text>
                    </div>
                  </Group>
                </div>
                
                <Group gap="sm">
                  <Badge color={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                  
                  <Text fw={700} size="lg">
                    €{payment.amount}
                  </Text>
                  
                  <Group gap="xs">
                    <ActionIcon
                      variant="outline"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsModalOpen(true);
                      }}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    
                    <ActionIcon
                      variant="outline"
                      color="blue"
                      onClick={() => handleDownloadInvoice(payment)}
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
          />
        </Group>
      )}

      {/* Payment Detail Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Payment Details"
        size="md"
      >
        {selectedPayment && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Vehicle:</Text>
              <Text>{selectedPayment.vehicleInfo}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Invoice ID:</Text>
              <Text>{selectedPayment.invoiceId}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Amount:</Text>
              <Text fw={700} size="lg">€{selectedPayment.amount}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Status:</Text>
              <Badge color={getStatusColor(selectedPayment.status)}>
                {selectedPayment.status}
              </Badge>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Payment Method:</Text>
              <Text>{selectedPayment.method}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Date:</Text>
              <Text>{formatDate(selectedPayment.date)}</Text>
            </Group>
            
            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={() => handleDownloadInvoice(selectedPayment)}
              >
                Download Invoice
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
