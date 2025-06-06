'use client';

import { useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDots,
  IconPencil,
  IconSearch,
} from '@tabler/icons-react';
import { Company, CompanyType } from '@/app/types/company';
import { useUpdateCompany } from '../hooks/useUpdateCompany';
import { useGetAllCompany } from '../hooks/useGetAllCompany';

const PAGE_SIZE = 4;
const PAGE_SIZE_PAGINATION = PAGE_SIZE + 1;

export function CompaniesStack() {
  const [search, setSearch] = useState('');
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [formValues, setFormValues] = useState<Omit<Company, 'id'>>({
    name: '',
    type: CompanyType.BUSINESS,
    address: '',
    vatNumber: '', 
    logoUrl: '',
  });
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const { data: companies = [], isLoading } = useGetAllCompany();
  const updateCompanyMutation = useUpdateCompany();

  const filteredCompanies = companies.filter((company) =>
    [company.name, company.type, company.address, company.address, company.vatNumber, company.logoUrl]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE);
  const paginatedCompanies = filteredCompanies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleEditClick = (company: Company) => {
    setEditCompany(company);
    setFormValues(company);
    open();
  };

  const handleFormChange = (field: keyof Company, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editCompany?.id) return;
    updateCompanyMutation.mutate(
      { id: editCompany.id, data: formValues },
      {
        onSuccess: () => {
          console.log('Company updated successfully');
          close();
        },
        onError: (error) => {
          console.error('Error updating company:', error);
        },
      }
    );
  };

  const rows = paginatedCompanies.map((company) => (
    <Table.Tr key={company.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={40} src={company.logoUrl} radius={40} />
          <Text fz="sm" fw={500}>{company.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{company.type || '—'}</Text>
        <Text fz="xs" c="dimmed">Type</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{company.address || '—'}</Text>
        <Text fz="xs" c="dimmed">Address</Text>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{company.vatNumber || '—'}</Text>
        <Text fz="xs" c="dimmed">vatNumber</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleEditClick(company)}>
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
      <Title order={3}>Companies</Title>

      <TextInput
        placeholder="Search by name, industry or location"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
      />

      {isLoading ? (
        <Group justify="center" mt="md">
          <Loader size="lg" />
        </Group>
      ) : (
        <>
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="md">
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {PAGE_SIZE_PAGINATION >= 1 && (
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              mt="md"
            />
          )}
        </>
      )}

      <Modal opened={opened} onClose={close} title="Edit Company" centered>
        <Stack>
          <TextInput
            label="Name"
            value={formValues.name}
            onChange={(e) => handleFormChange('name', e.currentTarget.value)}
          />
          {/* Select from enum  CompanyType*/}
          <TextInput
            label="Type"
            value={formValues.type}
            onChange={(e) => handleFormChange('type', e.currentTarget.value)}
          />
          <TextInput
            label="Address"
            value={formValues.address}
            onChange={(e) => handleFormChange('address', e.currentTarget.value)}
          />
          
           <TextInput
            label="VatNumber"
            value={formValues.vatNumber}
            onChange={(e) => handleFormChange('vatNumber', e.currentTarget.value)}
          />
          <TextInput
            label="Logo URL"
            value={formValues.logoUrl}
            onChange={(e) => handleFormChange('logoUrl', e.currentTarget.value)}
          />
          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
