import React from 'react';
import { Outlet } from 'react-router-dom';
import SupplierNav from '../components/SupplierNav';

export default function Supplier() {
  return (
    <div className="space-y-4 pb-12">
      <SupplierNav />
      <Outlet />
    </div>
  );
}
