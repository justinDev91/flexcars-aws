'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import { FeaturesCards } from '../companies/components/FeaturesCards';
import { useState, useEffect } from 'react';
import { Invoice } from '@/app/types/Invoice';
import { useGetAllInvoice } from './hooks/useGetAllInvoice';
import { InvoicesStack } from './components/InvoiceStack';
import CreateInvoiceForm from './components/CreateInvoiceForm';

export default function InvoicePage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const { data: fetchedInvoices = [] } = useGetAllInvoice();

  useEffect(() => {
    setInvoices(fetchedInvoices);
  }, [fetchedInvoices]);

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <FeaturesCards />

        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Invoice
          </Button>
        </Group>

        <Stack>
          <InvoicesStack invoices={invoices} setInvoices={setInvoices} />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new invoice" centered>
        <CreateInvoiceForm onSuccess={handleInvoiceCreated} />
      </Modal>
    </>
  );
}
