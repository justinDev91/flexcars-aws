'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconBellRinging,
  IconCalendarEvent,
  IconCar,
  IconCreditCard,
  IconLogout,
  IconMessages,
  IconSettings,
  IconSwitchHorizontal,
  IconUsers,
  IconChevronDown,
} from '@tabler/icons-react';
import { 
  AppShell,
  Group,
  UnstyledButton,
  Text,
  Menu,
  Avatar,
  Burger,
  Container,
  useMantineTheme,
  ActionIcon,
  Indicator,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { LanguagePicker } from './components/LanguagePicker';
import { logout } from '../logout';


const clientTabs = [
  { value: 'browse-vehicles', label: 'Browse Vehicles', icon: IconCar, link: '/browse-vehicles' },
  { value: 'my-reservations', label: 'My Reservations', icon: IconCalendarEvent, link: '/my-reservations' },
  { value: 'location-history', label: 'Location History', icon: IconCreditCard, link: '/payment-history' },
  { value: 'messages', label: 'Messages', icon: IconMessages, link: '/messages' },
  { value: 'profile', label: 'My Profile', icon: IconUsers, link: '/profile' },
];

export default function NavbarSegmented({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();
  const [activeTab, setActiveTab] = useState<string | null>('browse-vehicles');
  const theme = useMantineTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentTab = clientTabs.find(tab => pathname.includes(tab.value));
    if (currentTab) {
      setActiveTab(currentTab.value);
    }
  }, [pathname]);

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
    const selectedTab = clientTabs.find(tab => tab.value === value);
    if (selectedTab) {
      router.push(selectedTab.link);
    }
  };

  return (
    <AppShell
      header={{ height: 120 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="60" justify="space-between" align="center" px="md">
            {/* Logo and Brand */}
            <Group>
              <IconCar size={32} color={theme.colors.blue[6]} />
              <Text size="xl" fw={700} c="blue">
                FlexCars
              </Text>
              <Text size="sm" c="dimmed" ml="xs">
                Car Rental
              </Text>
            </Group>

            {/* Right section */}
            <Group>
              <LanguagePicker />
              
              <Indicator inline label="3" size={16}>
                <ActionIcon variant="light" size="lg" radius="md">
                  <IconBellRinging size={20} />
                </ActionIcon>
              </Indicator>

              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size="sm" radius="xl" />
                    <Text size="sm" ml="xs" mr="xs" visibleFrom="sm">
                      John Doe
                    </Text>
                    <IconChevronDown size={16} />
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    component={Link}
                    href="/profile"
                    leftSection={<IconUsers size={14} />}
                  >
                    My Profile
                  </Menu.Item>
                  <Menu.Item
                    component={Link}
                    href="/change-account"
                    leftSection={<IconSwitchHorizontal size={14} />}
                  >
                    Change Account
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    component={Link}
                    href="/settings"
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    onClick={logout}
                    color="red"
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            </Group>
          </Group>

          {/* Navigation Tabs */}
          <div>
            <div className="flex space-x-4">
              {clientTabs.map((tab) => (
                <div
                  key={tab.value}
                  className={`px-6 py-2 text-sm font-medium rounded-t-md transition-all duration-200 cursor-pointer ${
                    activeTab === tab.value
                      ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange(tab.value)}
                >
                  <tab.icon className="inline-block mr-2" size={16} />
                  {tab.label}
                </div>
              ))}
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </Container>
      </AppShell.Header>

      {/* Mobile Navigation */}
      <AppShell.Navbar p="md" hiddenFrom="sm">
        <Text size="lg" fw={600} mb="md" c="blue">
          FlexCars Menu
        </Text>

        {clientTabs.map((tab) => (
          <UnstyledButton
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              router.push(tab.link);
              toggle();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '4px',
              backgroundColor: activeTab === tab.value ? theme.colors.blue[0] : 'transparent',
              color: activeTab === tab.value ? theme.colors.blue[7] : theme.colors.gray[7],
            }}
          >
            <tab.icon size={20} style={{ marginRight: '12px' }} />
            <Text size="sm" fw={activeTab === tab.value ? 600 : 400}>
              {tab.label}
            </Text>
          </UnstyledButton>
        ))}
      </AppShell.Navbar>

      <Container size="xl" className="px-48 py-48 flex justify-center items-center">
          {children}
      </Container>

    </AppShell>
  );
}