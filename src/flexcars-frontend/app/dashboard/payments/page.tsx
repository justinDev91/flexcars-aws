'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { FeaturesCards } from '../companies/components/FeaturesCards';
import CreatePaymentForm from './components/CreatePaymentForm';
import { useState, useEffect } from 'react';
import { Payment } from '@/app/types/Payment';
import { useGetAllPayments } from './hooks/useGetAllPayment';
import { PaymentsStack } from './components/PaymentStack';

export default function PaymentsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  const { payments: fetchedPayments = [] } = useGetAllPayments();

  useEffect(() => {
    setPayments(fetchedPayments);
  }, [fetchedPayments]);

  const handlePaymentCreated = (newPayment: Payment) => {
    setPayments((prev) => [newPayment, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <FeaturesCards />

        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Payment
          </Button>
        </Group>

        <Stack>
          <PaymentsStack payments={payments} setPayments={setPayments} />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new payment" centered>
        <CreatePaymentForm onSuccess={handlePaymentCreated} />
      </Modal>
    </>
  );
}
