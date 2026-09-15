import React, { createContext, useContext, useState, useEffect } from 'react';

const FuelLogContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_fuel_logs';

const defaultFuelLogs = [];

export function FuelLogProvider({ children }) {
  const [fuelLogs, setFuelLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return defaultFuelLogs;
    } catch (err) {
      console.error('Failed to load fuel logs from localStorage:', err);
      return defaultFuelLogs;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fuelLogs));
    } catch (err) {
      console.error('Failed to save fuel logs to localStorage:', err);
    }
  }, [fuelLogs]);

  const addFuelLog = (data) => {
    const nextId =
      fuelLogs.length > 0
        ? Math.max(...fuelLogs.map((f) => Number(f.id) || 0)) + 1
        : 1;

    const todayISO = new Date().toISOString().split('T')[0];

    const newLog = {
      id: nextId,
      staffName: data.staffName ? data.staffName.trim() : 'Unassigned',
      date: data.date || todayISO,
      liters: Number(data.liters) || 0,
      amount: Number(data.amount) || 0,
      distanceKm: Number(data.distanceKm) || 0,
      notes: data.notes ? data.notes.trim() : '',
      createdAt: new Date().toISOString(),
    };

    setFuelLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  const deleteFuelLog = (id) => {
    setFuelLogs((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FuelLogContext.Provider
      value={{
        fuelLogs,
        addFuelLog,
        deleteFuelLog,
      }}
    >
      {children}
    </FuelLogContext.Provider>
  );
}

export function useFuelLogContext() {
  const context = useContext(FuelLogContext);
  if (!context) {
    throw new Error('useFuelLogContext must be used within a FuelLogProvider');
  }
  return context;
}
