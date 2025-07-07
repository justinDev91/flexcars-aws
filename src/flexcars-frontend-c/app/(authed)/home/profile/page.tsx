'use client';

import { useState } from 'react';
import { 
  Container, 
  Title, 
  Card, 
  Text, 
  Button, 
  Group, 
  Stack, 
  TextInput,
  Textarea,
  Avatar,
  Badge,
  Tabs,
  FileInput,
  Select,
  Switch,
  Divider,
  PasswordInput
} from '@mantine/core';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { IconUser, IconBell, IconShield, IconCamera, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function Profile() {
  const { user } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    birthDate: user?.birthDate || '',
    bio: 'Car enthusiast who loves exploring the city with different vehicles.',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    language: 'en',
    currency: 'EUR',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    // Here you would typically send the data to your backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    notifications.show({
      title: 'Success',
      message: 'Profile updated successfully',
      color: 'green',
    });
  };

  const handleSavePreferences = () => {
    // Here you would typically send the preferences to your backend
    console.log('Saving preferences:', preferences);
    notifications.show({
      title: 'Success',
      message: 'Preferences updated successfully',
      color: 'green',
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'New passwords do not match',
        color: 'red',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      notifications.show({
        title: 'Error',
        message: 'Password must be at least 8 characters long',
        color: 'red',
      });
      return;
    }

    // Here you would typically send the password change request to your backend
    console.log('Changing password');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    notifications.show({
      title: 'Success',
      message: 'Password changed successfully',
      color: 'green',
    });
  };

  const handleAvatarUpload = (file: File | null) => {
    if (file) {
      setAvatar(file);
      notifications.show({
        title: 'Success',
        message: 'Avatar uploaded successfully',
        color: 'green',
      });
    }
  };

  const getAccountLevel = () => {
    // Mock logic based on user activity
    return 'Gold';
  };

  const getAccountLevelColor = (level: string) => {
    switch (level) {
      case 'Gold':
        return 'yellow';
      case 'Silver':
        return 'gray';
      case 'Bronze':
        return 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl" className="text-gray-800">
        My Profile
      </Title>

      <Tabs defaultValue="profile" className="w-full">
        <Tabs.List>
          <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
            Profile Information
          </Tabs.Tab>
          <Tabs.Tab value="preferences" leftSection={<IconBell size={16} />}>
            Preferences
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
            Security
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" pt="md">
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>Profile Information</Title>
              <Button
                variant="outline"
                leftSection={isEditing ? <IconCheck size={16} /> : <IconEdit size={16} />}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Group>

            <Stack gap="md">
              {/* Avatar Section */}
              <Group>
                <Avatar
                  src={avatar ? URL.createObjectURL(avatar) : user?.avatar}
                  size="xl"
                  radius="md"
                />
                <div>
                  <Text fw={500} size="lg">
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {user?.email}
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Badge color={getAccountLevelColor(getAccountLevel())}>
                      {getAccountLevel()} Member
                    </Badge>
                    <Badge color="green" variant="light">
                      Verified
                    </Badge>
                  </Group>
                  {isEditing && (
                    <FileInput
                      mt="xs"
                      placeholder="Upload new avatar"
                      accept="image/*"
                      leftSection={<IconCamera size={16} />}
                      onChange={handleAvatarUpload}
                    />
                  )}
                </div>
              </Group>

              <Divider />

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(event) => setProfileData(prev => ({
                    ...prev,
                    firstName: event.currentTarget.value
                  }))}
                  disabled={!isEditing}
                />
                <TextInput
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(event) => setProfileData(prev => ({
                    ...prev,
                    lastName: event.currentTarget.value
                  }))}
                  disabled={!isEditing}
                />
                <TextInput
                  label="Email"
                  value={profileData.email}
                  onChange={(event) => setProfileData(prev => ({
                    ...prev,
                    email: event.currentTarget.value
                  }))}
                  disabled={!isEditing}
                />
                <TextInput
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={(event) => setProfileData(prev => ({
                    ...prev,
                    phoneNumber: event.currentTarget.value
                  }))}
                  disabled={!isEditing}
                />
                <TextInput
                  label="Birth Date"
                  type="date"
                  value={profileData.birthDate}
                  onChange={(event) => setProfileData(prev => ({
                    ...prev,
                    birthDate: event.currentTarget.value
                  }))}
                  disabled={!isEditing}
                />
              </div>

              <Textarea
                label="Bio"
                value={profileData.bio}
                onChange={(event) => setProfileData(prev => ({
                  ...prev,
                  bio: event.currentTarget.value
                }))}
                disabled={!isEditing}
                minRows={3}
              />

              {isEditing && (
                <Group justify="flex-end">
                  <Button
                    variant="outline"
                    leftSection={<IconX size={16} />}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<IconCheck size={16} />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="preferences" pt="md">
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>Preferences</Title>
              <Button onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </Group>

            <Stack gap="md">
              <div>
                <Text fw={500} mb="sm">Notifications</Text>
                <Stack gap="xs">
                  <Switch
                    label="Email notifications"
                    description="Receive notifications about reservations and updates"
                    checked={preferences.emailNotifications}
                    onChange={(event) => setPreferences(prev => ({
                      ...prev,
                      emailNotifications: event.currentTarget.checked
                    }))}
                  />
                  <Switch
                    label="SMS notifications"
                    description="Receive SMS for important updates"
                    checked={preferences.smsNotifications}
                    onChange={(event) => setPreferences(prev => ({
                      ...prev,
                      smsNotifications: event.currentTarget.checked
                    }))}
                  />
                  <Switch
                    label="Push notifications"
                    description="Receive push notifications in your browser"
                    checked={preferences.pushNotifications}
                    onChange={(event) => setPreferences(prev => ({
                      ...prev,
                      pushNotifications: event.currentTarget.checked
                    }))}
                  />
                  <Switch
                    label="Marketing emails"
                    description="Receive promotional offers and news"
                    checked={preferences.marketingEmails}
                    onChange={(event) => setPreferences(prev => ({
                      ...prev,
                      marketingEmails: event.currentTarget.checked
                    }))}
                  />
                </Stack>
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Language"
                  value={preferences.language}
                  onChange={(value) => setPreferences(prev => ({
                    ...prev,
                    language: value || 'en'
                  }))}
                  data={[
                    { value: 'en', label: 'English' },
                    { value: 'fr', label: 'Français' },
                    { value: 'es', label: 'Español' },
                    { value: 'de', label: 'Deutsch' },
                  ]}
                />
                <Select
                  label="Currency"
                  value={preferences.currency}
                  onChange={(value) => setPreferences(prev => ({
                    ...prev,
                    currency: value || 'EUR'
                  }))}
                  data={[
                    { value: 'EUR', label: 'Euro (€)' },
                    { value: 'USD', label: 'US Dollar ($)' },
                    { value: 'GBP', label: 'British Pound (£)' },
                  ]}
                />
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="security" pt="md">
          <Card withBorder>
            <Title order={3} mb="md">Security Settings</Title>

            <Stack gap="md">
              <div>
                <Text fw={500} mb="sm">Change Password</Text>
                <Stack gap="xs">
                  <PasswordInput
                    label="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(event) => setPasswordData(prev => ({
                      ...prev,
                      currentPassword: event.currentTarget.value
                    }))}
                  />
                  <PasswordInput
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={(event) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: event.currentTarget.value
                    }))}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(event) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: event.currentTarget.value
                    }))}
                  />
                  <Group justify="flex-end">
                    <Button onClick={handleChangePassword}>
                      Change Password
                    </Button>
                  </Group>
                </Stack>
              </div>

              <Divider />

              <div>
                <Text fw={500} mb="sm">Account Security</Text>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm">Two-Factor Authentication</Text>
                      <Text size="xs" c="dimmed">Add an extra layer of security</Text>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </Group>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm">Login Alerts</Text>
                      <Text size="xs" c="dimmed">Get notified of new device logins</Text>
                    </div>
                    <Switch defaultChecked />
                  </Group>
                </Stack>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
