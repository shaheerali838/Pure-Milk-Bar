import React, { createContext, useContext, useState, useEffect } from 'react';

const DeliveryStaffContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_delivery_staff';

const defaultStaff = [];

export function DeliveryStaffProvider({ children }) {
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return defaultStaff;
    } catch (err) {
      console.error('Failed to load delivery staff from localStorage:', err);
      return defaultStaff;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(staffList));
    } catch (err) {
      console.error('Failed to save delivery staff to localStorage:', err);
    }
  }, [staffList]);

  const addStaff = (data) => {
    const nextId =
      staffList.length > 0
        ? Math.max(...staffList.map((s) => Number(s.id) || 0)) + 1
        : 1;

    const newStaff = {
      id: nextId,
      name: data.name ? data.name.trim() : '',
      phone: data.phone ? data.phone.trim() : '',
      type: data.type || 'RIDER', // 'RIDER' | 'WALKING'
      vehicle: data.vehicle ? data.vehicle.trim() : '',
      route: data.route ? data.route.trim() : '',
      active: data.active !== undefined ? data.active : true,
      createdAt: new Date().toISOString(),
    };

    setStaffList((prev) => [newStaff, ...prev]);
    return newStaff;
  };

  const updateStaff = (id, data) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  };

  const toggleStaffActive = (id) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const deleteStaff = (id) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <DeliveryStaffContext.Provider
      value={{
        staffList,
        addStaff,
        updateStaff,
        toggleStaffActive,
        deleteStaff,
      }}
    >
      {children}
    </DeliveryStaffContext.Provider>
  );
}

export function useDeliveryStaffContext() {
  const context = useContext(DeliveryStaffContext);
  if (!context) {
    throw new Error('useDeliveryStaffContext must be used within a DeliveryStaffProvider');
  }
  return context;
}
