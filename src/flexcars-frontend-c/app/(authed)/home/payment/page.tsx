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
  Select,
  TextInput,
  Checkbox,
  Divider,
  Badge,
  Loader,
  Alert
} from '@mantine/core';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProcessPayment } from './hooks/useProcessPayment';
import { IconCreditCard, IconLock, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface PaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
  billingAddress: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function Payment() {
  const { user } = useAuthSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: `${user?.firstName} ${user?.lastName}` || '',
    billingAddress: '',
    city: '',
    postalCode: '',
    country: 'France',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [useStoredCard, setUseStoredCard] = useState(false);
  
  const { mutate: processPayment, isPending } = useProcessPayment();
  
  // Get reservation/invoice details from URL params
  const reservationId = searchParams.get('reservationId');
  const invoiceId = searchParams.get('invoiceId');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || 'Car Rental Payment';

  // Mock stored payment methods
  const storedCards = [
    {
      id: '1',
      last4: '4242',
      brand: 'visa',
      expiryMonth: '12',
      expiryYear: '25',
    },
    {
      id: '2',
      last4: '5555',
      brand: 'mastercard',
      expiryMonth: '10',
      expiryYear: '26',
    },
  ];

  useEffect(() => {
    if (!reservationId && !invoiceId) {
      router.push('/my-reservations');
    }
  }, [reservationId, invoiceId, router]);

  const handlePayment = async () => {
    if (!useStoredCard) {
      // Validate new card data
      if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv) {
        notifications.show({
          title: 'Error',
          message: 'Please fill in all payment details',
          color: 'red',
        });
        return;
      }
    }

    if (!invoiceId) {
      notifications.show({
        title: 'Error',
        message: 'No invoice found for payment',
        color: 'red',
      });
      return;
    }

    processPayment({
      invoiceId,
      amount,
      method: 'STRIPE',
      transactionId: `stripe_${Date.now()}`,
    }, {
      onSuccess: () => {
        router.push('/my-reservations?payment=success');
      },
    });
  };

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(event.target.value);
    setPaymentData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString().slice(-2), label: year.toString() };
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  if (!reservationId && !invoiceId) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          Invalid payment request. Please go back and try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="xl" ta="center">
        Complete Payment
      </Title>

      {/* Payment Summary */}
      <Card withBorder mb="xl">
        <Group justify="space-between" mb="md">
          <Text fw={500}>Payment Summary</Text>
          <Badge color="blue">{reservationId ? 'Reservation' : 'Invoice'}</Badge>
        </Group>
        
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm">Description:</Text>
            <Text size="sm">{description}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm">Amount:</Text>
            <Text size="sm" fw={500}>€{amount.toFixed(2)}</Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text fw={500}>Total:</Text>
            <Text fw={700} size="lg" c="blue">€{amount.toFixed(2)}</Text>
          </Group>
        </Stack>
      </Card>

      {/* Payment Method Selection */}
      <Card withBorder mb="xl">
        <Title order={4} mb="md">Payment Method</Title>
        
        {storedCards.length > 0 && (
          <Stack gap="md" mb="md">
            <Checkbox
              label="Use saved payment method"
              checked={useStoredCard}
              onChange={(event) => setUseStoredCard(event.currentTarget.checked)}
            />
            
            {useStoredCard && (
              <Select
                label="Select Card"
                placeholder="Choose a saved card"
                data={storedCards.map(card => ({
                  value: card.id,
                  label: `**** **** **** ${card.last4} (${card.brand.toUpperCase()}) - ${card.expiryMonth}/${card.expiryYear}`,
                }))}
              />
            )}
          </Stack>
        )}

        {!useStoredCard && (
          <Stack gap="md">
            <TextInput
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              leftSection={<IconCreditCard size={16} />}
              required
            />
            
            <Group grow>
              <Select
                label="Expiry Month"
                placeholder="MM"
                data={months}
                value={paymentData.expiryMonth}
                onChange={(value) => setPaymentData(prev => ({ ...prev, expiryMonth: value || '' }))}
                required
              />
              <Select
                label="Expiry Year"
                placeholder="YY"
                data={years}
                value={paymentData.expiryYear}
                onChange={(value) => setPaymentData(prev => ({ ...prev, expiryYear: value || '' }))}
                required
              />
              <TextInput
                label="CVV"
                placeholder="123"
                value={paymentData.cvv}
                onChange={(event) => setPaymentData(prev => ({ ...prev, cvv: event.currentTarget.value }))}
                maxLength={4}
                required
              />
            </Group>
            
            <TextInput
              label="Name on Card"
              placeholder="John Doe"
              value={paymentData.nameOnCard}
              onChange={(event) => setPaymentData(prev => ({ ...prev, nameOnCard: event.currentTarget.value }))}
              required
            />
            
            <Divider label="Billing Address" labelPosition="left" />
            
            <TextInput
              label="Address"
              placeholder="123 Main Street"
              value={paymentData.billingAddress}
              onChange={(event) => setPaymentData(prev => ({ ...prev, billingAddress: event.currentTarget.value }))}
              required
            />
            
            <Group grow>
              <TextInput
                label="City"
                placeholder="Paris"
                value={paymentData.city}
                onChange={(event) => setPaymentData(prev => ({ ...prev, city: event.currentTarget.value }))}
                required
              />
              <TextInput
                label="Postal Code"
                placeholder="75001"
                value={paymentData.postalCode}
                onChange={(event) => setPaymentData(prev => ({ ...prev, postalCode: event.currentTarget.value }))}
                required
              />
            </Group>
            
            <Select
              label="Country"
              value={paymentData.country}
              onChange={(value) => setPaymentData(prev => ({ ...prev, country: value || 'France' }))}
              data={[
                { value: 'France', label: 'France' },
                { value: 'Germany', label: 'Germany' },
                { value: 'Spain', label: 'Spain' },
                { value: 'Italy', label: 'Italy' },
                { value: 'UK', label: 'United Kingdom' },
              ]}
            />
            
            <Checkbox
              label="Save this card for future payments"
              checked={saveCard}
              onChange={(event) => setSaveCard(event.currentTarget.checked)}
            />
          </Stack>
        )}
      </Card>

      {/* Security Notice */}
      <Card withBorder mb="xl" bg="gray.0">
        <Group gap="sm">
          <IconLock size={16} className="text-green-600" />
          <Text size="sm" c="dimmed">
            Your payment information is encrypted and secure. We never store your card details.
          </Text>
        </Group>
      </Card>

      {/* Action Buttons */}
      <Group justify="space-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        
        <Button
          size="lg"
          onClick={handlePayment}
          loading={isPending}
          leftSection={isPending ? <Loader size={16} /> : <IconCheck size={16} />}
        >
          {isPending ? 'Processing...' : `Pay €${amount.toFixed(2)}`}
        </Button>
      </Group>
    </Container>
  );
}
