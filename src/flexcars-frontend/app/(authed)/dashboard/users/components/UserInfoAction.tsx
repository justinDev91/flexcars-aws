import { Avatar, Button, Paper, Text, Stack } from '@mantine/core';
import { User } from '../hooks/useFindUsers';

interface UserInfoActionProps {
  user: User;
}

export function UserInfoAction({ user }: Readonly<UserInfoActionProps>) {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    birthDate,
    avatar,
    company,
  } = user;

  return (
    <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
      <Avatar
        src={avatar || 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png'}
        size={120}
        radius={120}
        mx="auto"
      />
      <Text ta="center" fz="lg" fw={500} mt="md">
        {firstName} {lastName}
      </Text>
      <Text ta="center" c="dimmed" fz="sm">
        {email}
      </Text>

      <Stack mt="md">
        <Text ta="center" fz="sm">📞 {phoneNumber}</Text>
        <Text ta="center" fz="sm">🎂 {birthDate}</Text>
        {company && <Text ta="center" fz="sm">🏢 {company}</Text>}
      </Stack>

      <Button variant="default" fullWidth mt="md">
        Send message
      </Button>
    </Paper>
  );
}
