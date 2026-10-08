import React from 'react';
import { Users, Truck, Droplets } from 'lucide-react';
import SubNav from '../../../components/common/SubNav';

export const CUSTOMER_DELIVERY_TABS = [
  {
    id: 'customers',
    to: '/customer-hub/customers',
    aliasTo: ['/customer-hub', '/customer'],
    label: 'Customer & Accounts',
    icon: Users,
    color: '#009966', // Emerald Green
  },
  {
    id: 'daily-deliveries',
    to: '/customer-hub/daily-deliveries',
    label: 'Daily Monthly Deliveries',
    icon: Droplets,
    color: '#155dfc', // Electric Blue
  },
  {
    id: 'doorstep-deliveries',
    to: '/customer-hub/doorstep-deliveries',
    aliasTo: ['/delivery'],
    label: 'Doorstep Deliveries',
    icon: Truck,
    color: '#4f39f6', // Indigo Purple
  },
];

export default function CustomerDeliveryNav() {
  return <SubNav tabs={CUSTOMER_DELIVERY_TABS} />;
}

