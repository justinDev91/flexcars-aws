'use client';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Stack, Group, Container } from '@mantine/core';
import CreateDocumentForm from './components/CreateDocumentForm';
import { useState, useEffect } from 'react';
import { Document } from '@/app/types/Document';
import { useGetAllDocuments } from './hooks/useGetAllDocument';
import { DocumentsStack } from './components/DocumentStack';

export default function DocumentPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const { documents: fetchedDocuments = [] } = useGetAllDocuments();

  useEffect(() => {
    setDocuments(fetchedDocuments);
  }, [fetchedDocuments]);

  const handleDocumentCreated = (newDocument: Document) => {
    setDocuments((prev) => [newDocument, ...prev]);
    close();
  };

  return (
    <>
      <Container fluid px="md" py="md">
        <Group justify="flex-end" mb="sm">
          <Button variant="default" onClick={open}>
            Create Document
          </Button>
        </Group>

        <Stack>
          <DocumentsStack
            documents={documents}
            setDocuments={setDocuments}
          />
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} title="Create a new document" centered>
        <CreateDocumentForm onSuccess={handleDocumentCreated} />
      </Modal>
    </>
  );
}
