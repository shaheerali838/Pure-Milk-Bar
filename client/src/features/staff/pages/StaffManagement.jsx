import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffNav from '../components/StaffNav';

export default function StaffManagement() {
  return (
    <div className="space-y-4 pb-10">
      {/* Top Main Navigation Tabs */}
      <StaffNav />

      {/* Child Routes Outlet */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
