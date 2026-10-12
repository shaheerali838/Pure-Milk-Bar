import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StaffNav from '../components/StaffNav';
import DateHeader from '@/components/common/DateHeader';
import { useGlobalDate } from '@/context/GlobalDateContext';

export default function StaffManagement() {
  const location = useLocation();
  const { globalDate, setGlobalDate, setToday } = useGlobalDate();

  // Strict "Starts with Today" initialization
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    if (typeof setToday === 'function') {
      setToday();
    }
  }, [location.pathname]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (typeof setGlobalDate === 'function') {
      setGlobalDate(newDate);
    }
  };

  return (
    <div className="space-y-4">
      <DateHeader date={selectedDate} setDate={handleDateChange} />
      <StaffNav />
      <Outlet context={{ selectedDate, setSelectedDate: handleDateChange }} />
    </div>
  );
}
