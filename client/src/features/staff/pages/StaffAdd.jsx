import React from 'react';
import { useNavigate } from 'react-router-dom';
import StaffAddComponent from '../components/ManageStaff/StaffAdd';

export default function StaffAdd() {
  const navigate = useNavigate();

  return (
    <StaffAddComponent
      onCancel={() => navigate('/staff/manage')}
      onSuccess={() => navigate('/staff/manage')}
    />
  );
}
