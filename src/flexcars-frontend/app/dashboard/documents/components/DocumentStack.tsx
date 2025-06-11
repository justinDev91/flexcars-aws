'use client';

import { useState, useMemo } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Stack,
  Table,
  TextInput,
  Title,
  Select,
  Checkbox,
} from '@mantine/core';
import { DateInput, DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconPencil, IconSearch } from '@tabler/icons-react';
import { Document, DocumentType } from '@/app/types/Document';
import { useUpdateDocument } from '../hooks/useUpdateDocument';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';

const PAGE_SIZE = 5;

interface DocumentsStackProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

export function DocumentsStack({ documents, setDocuments }: Readonly<DocumentsStackProps>) {
  const [search, setSearch] = useState('');
  const [editDocument, setEditDocument] = useState<Document | null>(null);
  const [formValues, setFormValues] = useState<Omit<Document, 'id'>>({
    userId: '',
    type: DocumentType.ID_CARD,
    fileUrl: '',
    verified: false,
    uploadedAt: new Date().toISOString(),
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const updateDocumentMutation = useUpdateDocument();
  const { data: users = [] } = useGetAllUser();

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, `${u.firstName} ${u.lastName ?? ''}`])), [users]);

  const filteredDocuments = documents.filter((d) =>
    [userMap[d.userId], d.type, d.fileUrl]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredDocuments.length / PAGE_SIZE);
  const paginatedDocuments = filteredDocuments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditClick = (doc: Document) => {
    setEditDocument(doc);
    setFormValues({ ...doc });
    open();
  };

  const handleFormChange = <K extends keyof Document>(field: K, value: Document[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editDocument?.id) return;
    updateDocumentMutation.mutate(
      { id: editDocument.id, data: formValues },
      {
        onSuccess: () => {
          setDocuments((prev) =>
            prev.map((d) => (d.id === editDocument.id ? { ...editDocument, ...formValues } : d))
          );
          close();
        },
        onError: (error) => {
          console.error('Error updating document:', error);
        },
      }
    );
  };

  const rows = paginatedDocuments.map((d) => (
    <Table.Tr key={d.id}>
      <Table.Td>{userMap[d.userId] || d.userId}</Table.Td>
      <Table.Td>{d.type}</Table.Td>
      <Table.Td>{d.fileUrl}</Table.Td>
      <Table.Td>{d.verified ? 'Yes' : 'No'}</Table.Td>
      <Table.Td>{new Date(d.uploadedAt).toLocaleString()}</Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(d)}>
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray">
            <IconDots size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Title order={3}>Documents</Title>

      <TextInput
        placeholder="Search by user, type, or URL..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {documents.length === 0 ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>File URL</Table.Th>
                  <Table.Th>Verified</Table.Th>
                  <Table.Th>Uploaded At</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Pagination total={totalPages} value={page} onChange={setPage} mt="md" />
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Document" centered>
        <Stack>
          <Select
            label="User"
            data={users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName ?? ''}` }))}
            value={formValues.userId}
            onChange={(value) => handleFormChange('userId', value!)}
            disabled
          />

          <Select
            label="Document Type"
            data={Object.values(DocumentType).map((t) => ({ value: t, label: t.replace('_', ' ') }))}
            value={formValues.type}
            onChange={(value) => handleFormChange('type', value as DocumentType)}
          />

          <TextInput
            label="File URL"
            value={formValues.fileUrl ?? ''}
            onChange={(e) => handleFormChange('fileUrl', e.currentTarget.value)}
          />

          <Checkbox
            label="Verified"
            checked={formValues.verified}
            onChange={(e) => handleFormChange('verified', e.currentTarget.checked)}
          />

          {/* <DateInput
            label="Uploaded At"
            value={new Date(formValues.uploadedAt)}
            onChange={(value) => handleFormChange('uploadedAt', value as string)}
          /> */}

          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}