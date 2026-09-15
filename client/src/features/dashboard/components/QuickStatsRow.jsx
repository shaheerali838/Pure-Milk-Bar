import React from 'react';
import { Tractor, Truck, ShoppingCart, Receipt } from 'lucide-react';
import DashboardEmptyStat from './DashboardEmptyStat';

export default function QuickStatsRow() {
  const emptyStats = [
    {
      title: 'Farm Production',
      icon: Tractor,
      color: '#009966',
    },
    {
      title: 'Purchased Milk',
      icon: Truck,
      color: '#155dfc',
    },
    {
      title: "Today's Retail Sales",
      icon: ShoppingCart,
      color: '#4f39f6',
    },
    {
      title: 'Farm & Shop Expenses',
      icon: Receipt,
      color: '#d97706',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {emptyStats.map((stat) => (
        <DashboardEmptyStat
          key={stat.title}
          title={stat.title}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}
