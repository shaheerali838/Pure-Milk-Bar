import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import deliveryService from '@/services/deliveryService';

const FuelLogContext = createContext();

export function FuelLogProvider({ children }) {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live fuel logs from database API
  const fetchFuelLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await deliveryService.getFuelLogs();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.logs)
        ? res.logs
        : Array.isArray(res?.data?.logs)
        ? res.data.logs
        : Array.isArray(res?.data)
        ? res.data
        : [];
      const normalized = list.map((f) => ({
        ...f,
        id: f._id || f.id || Date.now(),
        staffName: f.staffName || f.riderName || 'Unassigned',
        date: f.date ? f.date.split('T')[0] : new Date().toISOString().split('T')[0],
        liters: Number(f.liters || f.quantity) || 0,
        amount: Number(f.amount || f.cost) || 0,
        distanceKm: Number(f.distanceKm || f.mileage) || 0,
        notes: f.notes || '',
      }));
      setFuelLogs(normalized);
    } catch (err) {
      console.warn('Failed to load fuel logs from database API:', err.message);
      setFuelLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFuelLogs();
  }, [fetchFuelLogs]);

  const addFuelLog = async (data) => {
    const todayISO = new Date().toISOString().split('T')[0];

    const newLog = {
      id: Date.now(),
      staffName: data.staffName ? data.staffName.trim() : 'Unassigned',
      date: data.date || todayISO,
      liters: Number(data.liters) || 0,
      amount: Number(data.amount || data.costRupees) || 0,
      distanceKm: Number(data.distanceKm) || 0,
      notes: data.notes ? data.notes.trim() : '',
      createdAt: new Date().toISOString(),
    };

    setFuelLogs((prev) => [newLog, ...prev]);

    // Sync to backend database
    try {
      const res = await deliveryService.createFuelLog({
        staffName: newLog.staffName,
        date: newLog.date,
        shift: (data.shift || 'MORNING').toUpperCase(),
        vehiclePlate: data.vehiclePlate || 'STANDARD',
        liters: newLog.liters,
        amount: newLog.amount,
        costRupees: newLog.amount,
        distanceKm: newLog.distanceKm,
        notes: newLog.notes,
      });
      const created = res?.data || res?.log || res;
      if (created && (created._id || created.id)) {
        const realId = created._id || created.id;
        setFuelLogs((prev) => prev.map((f) => f.id === newLog.id ? { ...f, _id: realId, id: realId } : f));
      }
    } catch (e) {
      console.warn('Fuel log API sync notice:', e.message);
    }

    return newLog;
  };

  const deleteFuelLog = async (id) => {
    setFuelLogs((prev) => prev.filter((f) => (f._id || f.id) !== id && f.id !== id));
    try {
      await deliveryService.deleteFuelLog(id);
    } catch (e) {
      console.warn('Fuel log delete API sync skipped:', e.message);
    }
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
