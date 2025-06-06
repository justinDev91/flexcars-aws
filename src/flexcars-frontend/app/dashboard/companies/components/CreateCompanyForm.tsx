'use client';

import {
  Box,
  Button,
  Group,
  TextInput,
  Stack,
  Select,
} from '@mantine/core';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useForm } from '@mantine/form';
import { createCompanySchema, createCompanyInitialValues, CreateCompanyFormValues } from '../../../validations/createCompany.schema';
import { useCreateCompany } from '../hooks/useCreateCompany';

interface CreateCompanyFormProps {
  onSuccess?: () => void;
}

export default function CreateCompanyForm({ onSuccess }: Readonly<CreateCompanyFormProps>) {
  const createCompanyMutation = useCreateCompany();

  const form = useForm<CreateCompanyFormValues>({
    validate: zodResolver(createCompanySchema),
    initialValues: createCompanyInitialValues,
  });

  const handleSubmit = (values: typeof form.values) => {
    createCompanyMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        console.error('Error creating company:', error);
      },
    });
  };

  return (
    <Box maw={500} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Company Name"
            placeholder="Acme Corp"
            required
            {...form.getInputProps('name')}
          />
 
          <Select
            label="Company Type"
            placeholder="Select type"
            data={[
              { value: 'DEALERSHIP', label: 'Dealership' },
              { value: 'RENTAL_AGENCY', label: 'Rental Agency' },
              { value: 'BUSINESS', label: 'Business' },
            ]}
            required
            {...form.getInputProps('type')}
          />

          <TextInput
            label="Address"
            placeholder="123 Rue de Paris"
            required
            {...form.getInputProps('address')}
          />

          <TextInput
            label="VAT Number"
            placeholder="FR123456789"
            required
            {...form.getInputProps('vatNumber')}
          />

          <TextInput
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            required
            {...form.getInputProps('logoUrl')}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">
            Create Company
          </Button>
        </Group>
      </form>
    </Box>
  );
}
