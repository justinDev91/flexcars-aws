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
  Switch,
  Select,
  Divider,
  PasswordInput,
  TextInput,
  Alert
} from '@mantine/core';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { IconSettings, IconBell, IconShield, IconPalette, IconWorld, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function Settings() {
  const { user } = useAuthSession();
  
  const [notifications_settings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    reservationUpdates: true,
    paymentConfirmations: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    theme: 'light',
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: '30',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveNotifications = () => {
    // Save notification settings
    notifications.show({
      title: 'Success',
      message: 'Notification settings updated',
      color: 'green',
    });
  };

  const handleSavePreferences = () => {
    // Save user preferences
    notifications.show({
      title: 'Success',
      message: 'Preferences updated',
      color: 'green',
    });
  };

  const handleSaveSecurity = () => {
    // Save security settings
    notifications.show({
      title: 'Success',
      message: 'Security settings updated',
      color: 'green',
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      notifications.show({
        title: 'Error',
        message: 'Password must be at least 8 characters',
        color: 'red',
      });
      return;
    }

    // Change password logic here
    notifications.show({
      title: 'Success',
      message: 'Password changed successfully',
      color: 'green',
    });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl" className="text-gray-800">
        Settings
      </Title>

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card padding="lg" withBorder>
          <Group mb="md">
            <IconBell size={20} className="text-blue-500" />
            <Title order={3}>Notifications</Title>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={500}>Email Notifications</Text>
                <Text size="sm" c="dimmed">Receive updates via email</Text>
              </div>
              <Switch
                checked={notifications_settings.emailNotifications}
                onChange={(event) => setNotificationSettings({
                  ...notifications_settings,
                  emailNotifications: event.currentTarget.checked
                })}
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>SMS Notifications</Text>
                <Text size="sm" c="dimmed">Receive important updates via SMS</Text>
              </div>
              <Switch
                checked={notifications_settings.smsNotifications}
                onChange={(event) => setNotificationSettings({
                  ...notifications_settings,
                  smsNotifications: event.currentTarget.checked
                })}
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Push Notifications</Text>
                <Text size="sm" c="dimmed">Receive push notifications in browser</Text>
              </div>
              <Switch
                checked={notifications_settings.pushNotifications}
                onChange={(event) => setNotificationSettings({
                  ...notifications_settings,
                  pushNotifications: event.currentTarget.checked
                })}
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Marketing Emails</Text>
                <Text size="sm" c="dimmed">Receive promotional offers and news</Text>
              </div>
              <Switch
                checked={notifications_settings.marketingEmails}
                onChange={(event) => setNotificationSettings({
                  ...notifications_settings,
                  marketingEmails: event.currentTarget.checked
                })}
              />
            </Group>

            <Group justify="flex-end">
              <Button onClick={handleSaveNotifications}>
                Save Notification Settings
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Preferences */}
        <Card padding="lg" withBorder>
          <Group mb="md">
            <IconPalette size={20} className="text-purple-500" />
            <Title order={3}>Preferences</Title>
          </Group>
          
          <Stack gap="md">
            <Group grow>
              <Select
                label="Language"
                value={preferences.language}
                onChange={(value) => setPreferences({...preferences, language: value || 'en'})}
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'Français' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'es', label: 'Español' },
                ]}
              />
              <Select
                label="Currency"
                value={preferences.currency}
                onChange={(value) => setPreferences({...preferences, currency: value || 'EUR'})}
                data={[
                  { value: 'EUR', label: 'Euro (€)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'GBP', label: 'British Pound (£)' },
                ]}
              />
            </Group>

            <Group grow>
              <Select
                label="Timezone"
                value={preferences.timezone}
                onChange={(value) => setPreferences({...preferences, timezone: value || 'Europe/Paris'})}
                data={[
                  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
                  { value: 'Europe/London', label: 'London (UTC+0)' },
                  { value: 'America/New_York', label: 'New York (UTC-5)' },
                  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
                ]}
              />
              <Select
                label="Theme"
                value={preferences.theme}
                onChange={(value) => setPreferences({...preferences, theme: value || 'light'})}
                data={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto' },
                ]}
              />
            </Group>

            <Group justify="flex-end">
              <Button onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Security Settings */}
        <Card padding="lg" withBorder>
          <Group mb="md">
            <IconShield size={20} className="text-green-500" />
            <Title order={3}>Security</Title>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={500}>Two-Factor Authentication</Text>
                <Text size="sm" c="dimmed">Add an extra layer of security</Text>
              </div>
              <Switch
                checked={security.twoFactorAuth}
                onChange={(event) => setSecurity({
                  ...security,
                  twoFactorAuth: event.currentTarget.checked
                })}
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Login Notifications</Text>
                <Text size="sm" c="dimmed">Get notified of new logins</Text>
              </div>
              <Switch
                checked={security.loginNotifications}
                onChange={(event) => setSecurity({
                  ...security,
                  loginNotifications: event.currentTarget.checked
                })}
              />
            </Group>

            <Select
              label="Session Timeout"
              description="Automatically log out after inactivity"
              value={security.sessionTimeout}
              onChange={(value) => setSecurity({...security, sessionTimeout: value || '30'})}
              data={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
                { value: '120', label: '2 hours' },
                { value: 'never', label: 'Never' },
              ]}
            />

            <Group justify="flex-end">
              <Button onClick={handleSaveSecurity}>
                Save Security Settings
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Change Password */}
        <Card padding="lg" withBorder>
          <Group mb="md">
            <IconShield size={20} className="text-red-500" />
            <Title order={3}>Change Password</Title>
          </Group>
          
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(event) => setPasswordData({
                ...passwordData,
                currentPassword: event.currentTarget.value
              })}
            />
            
            <Group grow>
              <PasswordInput
                label="New Password"
                value={passwordData.newPassword}
                onChange={(event) => setPasswordData({
                  ...passwordData,
                  newPassword: event.currentTarget.value
                })}
              />
              <PasswordInput
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(event) => setPasswordData({
                  ...passwordData,
                  confirmPassword: event.currentTarget.value
                })}
              />
            </Group>

            <Alert icon={<IconCheck size={16} />} title="Password Requirements" color="blue">
              <ul className="text-sm">
                <li>At least 8 characters long</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            </Alert>

            <Group justify="flex-end">
              <Button 
                onClick={handleChangePassword}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                Change Password
              </Button>
            </Group>
          </Stack>
        </Card>
      </div>
    </Container>
  );
}
