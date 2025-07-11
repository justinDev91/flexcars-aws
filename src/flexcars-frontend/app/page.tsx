"use client";

import { Button, Checkbox, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useGetAllUser } from './(authed)/dashboard/users/hooks/useGetAllUsers';

export default function Demo() {

  console.log("NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL); // Debugging line to check the environment variable

  // TODO: test api call get all users
  const { users, isUsersLoading } = useGetAllUser();                 
  console.log("users", users); 
  
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      termsOfService: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        withAsterisk
        label="Email"
        placeholder="your@email.com"
        key={form.key('email')}
        {...form.getInputProps('email')}
      />

      <Checkbox
        mt="md"
        label="I agree to sell my privacy"
        key={form.key('termsOfService')}
        {...form.getInputProps('termsOfService', { type: 'checkbox' })}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}