'use client';

import {
  Box,
  Button,
  Group,
  Stack,
  Select,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useCreateDocument } from '../hooks/useCreateDocument';
import { Document } from '@/app/types/Document';
import { useGetAllUser } from '../../users/hooks/useGetAllUsers';
import { CreateDocumentFormValues, createDocumentInitialValues, createDocumentSchema } from '@/app/validations/document.schema';

interface CreateDocumentFormProps {
  onSuccess?: (document: Document) => void;
}

export default function CreateDocumentForm({ onSuccess }: Readonly<CreateDocumentFormProps>) {
  const createDocumentMutation = useCreateDocument();
  const { data: users = [], isLoading: isUsersLoading } = useGetAllUser();

  const form = useForm<CreateDocumentFormValues>({
    validate: zodResolver(createDocumentSchema),
    initialValues: createDocumentInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    const parsedValues = {
      ...values,
      uploadedAt: new Date(values.uploadedAt).toISOString(),
    };

    createDocumentMutation.mutate(parsedValues, {
      onSuccess: (newDocument) => {
        form.reset();
        onSuccess?.(newDocument);
      },
      onError: (error) => {
        console.error('Error creating document:', error);
      },
    });
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="User"
            placeholder={isUsersLoading ? 'Loading users...' : 'Select a user'}
            data={users.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName ?? ''}`,
            }))}
            searchable
            clearable
            disabled={isUsersLoading}
            {...form.getInputProps('userId')}
          />

          <Select
            label="Document Type"
            placeholder="Select document type"
            data={[
              { value: 'ID_CARD', label: 'ID Card' },
              { value: 'DRIVER_LICENSE', label: 'Driver License' },
              { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address' },
            ]}
            {...form.getInputProps('type')}
          />

          <TextInput
            label="File URL"
            placeholder="https://example.com/document.pdf"
            {...form.getInputProps('fileUrl')}
          />

          <Checkbox
            label="Verified"
            {...form.getInputProps('verified', { type: 'checkbox' })}
          />

        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={createDocumentMutation.isPending}>
            Create Document
          </Button>
        </Group>
      </form>
    </Box>
  );
}
