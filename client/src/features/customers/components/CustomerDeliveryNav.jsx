import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Truck,
  Droplets,
} from 'lucide-react';

export const CUSTOMER_DELIVERY_TABS = [
  {
    id: 'customers',
    to: '/customer-hub/customers',
    aliasTo: '/customer-hub',
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
    label: 'Doorstep Deliveries',
    icon: Truck,
    color: '#4f39f6', // Indigo Purple
  },
];

export default function CustomerDeliveryNav() {
  const { pathname } = useLocation();

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 min-w-max">
        {CUSTOMER_DELIVERY_TABS.map(({ to, label, icon: Icon, color, aliasTo }) => {
          const isActive =
            pathname === to ||
            (aliasTo && (pathname === aliasTo || pathname === `${aliasTo}/`)) ||
            (to !== '/customer-hub/customers' && pathname.startsWith(to)) ||
            (to === '/customer-hub/customers' && (pathname === '/customer-hub' || pathname === '/customer-hub/' || pathname === '/customer-hub/customers'));

          return (
            <NavLink
              key={to}
              to={to}
              className="compact-control flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer font-bold text-xs text-white select-none hover:brightness-110 shadow-none"
              style={{
                backgroundColor: isActive ? color : `${color}dd`,
                border: isActive
                  ? '2px solid rgba(255, 255, 255, 0.45)'
                  : '2px solid transparent',
              }}
            >
              <Icon className="w-4 h-4 shrink-0 text-white" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
