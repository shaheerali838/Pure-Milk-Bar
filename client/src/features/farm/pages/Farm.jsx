import React from 'react';
import { Outlet } from 'react-router-dom';
import FarmNav from '../components/FarmNav';

export default function Farm() {
  return (
    <div className="space-y-2">
      <FarmNav />
      <Outlet />
    </div>
  );
}
