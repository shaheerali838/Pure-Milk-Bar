import React from 'react';
import { Outlet } from 'react-router-dom';
import SupplierNav from '../components/SupplierNav';

export default function Supplier() {
  return (
    <div className="space-y-2 pb-7">
      <SupplierNav />
      <Outlet />
    </div>
  );
}
