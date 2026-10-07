import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerDeliveryNav from '../components/CustomerDeliveryNav';

export default function CustomerDeliveryHub() {
  return (
    <div className="customer-delivery-compact space-y-2 pb-1">
      <CustomerDeliveryNav />
      <Outlet />
    </div>
  );
}
