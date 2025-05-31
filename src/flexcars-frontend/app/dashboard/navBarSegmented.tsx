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
  IconLicense,
  IconLogout,
  IconMessage2,
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

const tabs = {
  'vehicle-rental': [
    { link: '', label: 'Customers', icon: IconUsers },
    { link: '', label: 'Companies', icon: IconBuilding },
    { link: '', label: 'Vehicles', icon: IconCar },
    { link: '', label: 'Reservation', icon: IconCalendarEvent },
    { link: '', label: 'Incident', icon: IconAlertTriangle },
    { link: '', label: 'CarSitters', icon: IconUserCheck },
    { link: '', label: 'Vehicle Recommendation', icon: IconThumbUp },
    { link: '', label: 'Notifications', icon: IconBellRinging },
    { link: '', label: 'Other Settings', icon: IconSettings },
  ],
  'admin-management': [
    { link: '', label: 'Invoices', icon: IconReceipt2 },
    { link: '', label: 'Rental Contracts', icon: IconFileText },
    { link: '', label: 'Receipts', icon: IconLicense },
    { link: '', label: 'Reviews', icon: IconMessage2 },
    { link: '', label: 'Payments', icon: IconCreditCard },
    { link: '', label: 'Messages', icon: IconMessages },
    { link: '', label: 'Refunds', icon: IconReceiptRefund },
    { link: '', label: 'Files & Documents', icon: IconFileAnalytics },
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
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
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
          <Link href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
            <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
            <span>Change account</span>
          </Link>

          <Link href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
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
