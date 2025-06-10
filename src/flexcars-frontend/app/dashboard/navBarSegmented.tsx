'use client';

import { useState } from 'react';
import {
  IconAlertTriangle,
  IconBellRinging,
  IconBuilding,
  IconCalendarEvent,
  IconCar,
  IconCreditCard,
  IconFileAnalytics,
  IconFileText,
  IconLogout,
  IconMessages,
  IconReceipt2,
  IconReceiptRefund,
  IconSettings,
  IconSwitchHorizontal,
  IconThumbUp,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import { SegmentedControl, Text } from '@mantine/core';
import classes from './styles/NavbarSegmented.module.css';
import Link from 'next/link';
import { LanguagePicker } from './components/LanguagePicker';

const tabs = {
  'vehicle-rental': [
    { link: '/dashboard/users', label: 'Customers', icon: IconUsers },
    { link: '/dashboard/companies', label: 'Companies', icon: IconBuilding },
    { link: '/dashboard/vehicles', label: 'Vehicles', icon: IconCar },
    { link: '/dashboard/reservations', label: 'Reservations', icon: IconCalendarEvent },
    { link: '/dashboard/incidents', label: 'Incidents', icon: IconAlertTriangle },
    { link: '/dashboard/car-sitters', label: 'CarSitters', icon: IconUserCheck },
    { link: '/dashboard/vehicle-recommendations', label: 'Vehicle Recommendation', icon: IconThumbUp },
    { link: '/dashboard/notifications', label: 'Notifications', icon: IconBellRinging },
    { link: '/dashboard/vehicle-maintenances', label: 'Vehicle Maintenance', icon: IconSettings },
    { link: '/dashboard/others-settings', label: 'Other Settings', icon: IconSettings },

  ],
  'admin-management': [
    { link: '/dashboard/invoices', label: 'Invoices', icon: IconReceipt2 },
    { link: '/dashboard/rental-contracts', label: 'Rental Contracts', icon: IconFileText },
    { link: '/dashboard/payments', label: 'Payments', icon: IconCreditCard },
    { link: '', label: 'Messages', icon: IconMessages },
    { link: '', label: 'Refunds', icon: IconReceiptRefund },
    { link: '/dashboard/documents', label: 'Files & Documents', icon: IconFileAnalytics },
  ],
};

export default function NavbarSegmented({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [section, setSection] = useState<'vehicle-rental' | 'admin-management'>('vehicle-rental');
  const [active, setActive] = useState('Billing');

 
  const links = tabs[section].map((item) => (
    <Link
      href={item.link || '#'}
      key={item.label}
      className={classes.link}
      data-active={item.label === active || undefined}
      onClick={(e) => {
        if (!item.link) e.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));


  return (
    <div className={classes.layout}>
      <nav className={classes.navbar}>
        <div>
          <div>
            <LanguagePicker />
          </div>
          <Text fw={500} size="sm" className={classes.title} c="dimmed" mb="xs">
            bgluesticker@mantine.dev
          </Text>

          <SegmentedControl
            value={section}
            onChange={(value: any) => setSection(value)}
            transitionTimingFunction="ease"
            fullWidth
            data={[
              { label: 'Vehicle Rental', value: 'vehicle-rental' },
              { label: 'Admin Management', value: 'admin-management' },
            ]}
          />
        </div>

        <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <Link
          href="/change-account" 
          className={classes.link}
        >
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </Link>

        <Link
          href="/logout" 
          className={classes.link}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </Link>
      </div>

      </nav>

      <main className={classes.content}>
        {children}
      </main>
    </div>
  );
}