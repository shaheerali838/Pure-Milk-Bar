import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffNav from '../components/StaffNav';

export default function StaffManagement() {
  return (
    <div className="space-y-4">
      <StaffNav />
      <Outlet />
    </div>
  );
}
