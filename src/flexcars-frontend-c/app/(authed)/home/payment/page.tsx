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
  Alert,
  NumberInput,
  Modal
} from '@mantine/core';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { useRouter } from 'next/navigation';
import { useProcessPayment } from './hooks/useProcessPayment';
import { IconCreditCard, IconLock, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';

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

interface PaymentProps {
  reservationId?: string;
  invoiceId?: string;
  amount?: number;
  description?: string;
  onClose?: () => void;
}

export default function Payment(props: PaymentProps) {
  const { user } = useAuthSession();
  const router = useRouter();
  const reservationId = props.reservationId;
  const invoiceId = props.invoiceId;
  const amount = props.amount ?? 0;
  const description = props.description ?? 'Car Rental Payment';

  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [useStoredCard, setUseStoredCard] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  const { mutate: processPayment, isPending } = useProcessPayment();
  
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

  const form = useForm({
    initialValues: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      nameOnCard: `${user?.firstName} ${user?.lastName}` || '',
      billingAddress: '',
      city: '',
      postalCode: '',
      country: 'France',
    },
  });

  useEffect(() => {
    if (!reservationId && !invoiceId) {
      router.push('/home/my-reservations');
    }
  }, [reservationId, invoiceId, router]);

  const handlePayment = async () => {
    const paymentData = form.values;
    if (!useStoredCard) {
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
        setSuccessModalOpen(true);
        setTimeout(() => {
          setSuccessModalOpen(false);
          router.push('/home/my-reservations');
        }, 2000);
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
    form.setFieldValue('cardNumber', formatted);
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
    <>
      <Modal opened={successModalOpen} onClose={() => setSuccessModalOpen(false)} centered withCloseButton={false}>
        <Group align="center" justify="center">
          <IconCheck size={48} color="green" />
        </Group>
        <Title order={3} ta="center" mt="md">Payment Successful!</Title>
        <Text ta="center" mt="sm">You will be redirected to your reservations.</Text>
      </Modal>
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
                maxLength={19}
                leftSection={<IconCreditCard size={16} />}
                required
                {...form.getInputProps('cardNumber')}
              />
              
              <Group grow>
                <Select
                  label="Expiry Month"
                  placeholder="MM"
                  data={months}
                  required
                  {...form.getInputProps('expiryMonth')}
                />
                <Select
                  label="Expiry Year"
                  placeholder="YY"
                  data={years}
                  required
                  {...form.getInputProps('expiryYear')}
                />
                <NumberInput
                  label="CVV"
                  placeholder="123"
                  maxLength={4}
                  required
                  {...form.getInputProps('cvv')}
                />
              </Group>
              
              <TextInput
                label="Name on Card"
                placeholder="John Doe"
                required
                {...form.getInputProps('nameOnCard')}
              />
              <Divider label="Billing Address" labelPosition="left" />
              <TextInput
                label="Address"
                placeholder="123 Main Street"
                required
                {...form.getInputProps('billingAddress')}
              />
              <Group grow>
                <TextInput
                  label="City"
                  placeholder="Paris"
                  required
                  {...form.getInputProps('city')}
                />
                <TextInput
                  label="Postal Code"
                  placeholder="75001"
                  required
                  {...form.getInputProps('postalCode')}
                />
              </Group>
              
              <Select
                label="Country"
                data={[
                  { value: 'France', label: 'France' },
                  { value: 'Germany', label: 'Germany' },
                  { value: 'Spain', label: 'Spain' },
                  { value: 'Italy', label: 'Italy' },
                  { value: 'UK', label: 'United Kingdom' },
                ]}
                {...form.getInputProps('country')}
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
            onClick={props.onClose ? props.onClose : () => router.back()}
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
    </>
  );
}
