'use client';

import {
  Box,
  Button,
  Group,
  TextInput,
  Stack,
  SegmentedControl,
  Select,
} from '@mantine/core';
import { zodResolver } from 'mantine-form-zod-resolver';
import { DateInput } from '@mantine/dates';
import { useForm} from '@mantine/form';
import { z } from 'zod';
import { useState } from 'react';
import { PasswordStrength } from './PasswordStrength';
import { InputValidation } from './InputValidation';
import segmentedClasses from '../../styles/GradientSegmentedControl.module.css';
import selectClasses from '../../styles/ContainedInput.module.css';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  companyId: z.string().optional(),
});

export default function CreateUserForm() {
  const [userType, setUserType] = useState<'Client' | 'Company'>('Client');

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      birthDate: null,
      companyId: '',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log('Form submitted:', { ...values, userType });
    // Submit logic here
  };

  return (
    <Box maw={500} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SegmentedControl
          radius="xl"
          size="md"
          data={['Client', 'Company']}
          value={userType}
          onChange={(value) => setUserType(value as 'Client' | 'Company')}
          classNames={segmentedClasses}
          mb="md"
        />
  
        <InputValidation {...form.getInputProps('email')} />
        
        <PasswordStrength
          value={form.values.password}
          {...form.getInputProps('password')}
        />

        <Stack mt="md">
          <TextInput
            label="First Name"
            placeholder="Jane"
            required
            {...form.getInputProps('firstName')}
          />

          <TextInput
            label="Last Name"
            placeholder="Doe"
            required
            {...form.getInputProps('lastName')}
          />

          <TextInput
            label="Phone Number"
            placeholder="+33 6 12 34 56 78"
            {...form.getInputProps('phoneNumber')}
          />

          <DateInput
            label="Birth Date"
            placeholder="Pick date"
            valueFormat="YYYY-MM-DD"
            {...form.getInputProps('birthDate')}
          />

          {userType === 'Company' && (
            <Select
              label="Select Company"
              placeholder="Pick a company"
              data={[
                { value: 'company-uuid-1234', label: 'Acme Corp' },
                { value: 'company-uuid-5678', label: 'Globex Inc.' },
                { value: 'company-uuid-9012', label: 'Initech' },
              ]}
              classNames={selectClasses}
              {...form.getInputProps('companyId')}
            />
          )}
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create User</Button>
        </Group>
      </form>
    </Box>
  );
}
