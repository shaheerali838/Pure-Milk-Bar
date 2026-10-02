import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import deliveryService from '../services/deliveryService.js';
import api from '../services/api.js';

const FuelLogContext = createContext();

export function FuelLogProvider({ children }) {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live fuel logs from database API + Finance Expenses (category: FUEL / TRANSPORT)
  const fetchFuelLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fuelRes, expenseRes] = await Promise.allSettled([
        deliveryService.getFuelLogs(),
        api.finance.getExpenses({ limit: 500 }),
      ]);

      const rawFuelList =
        fuelRes.status === 'fulfilled'
          ? Array.isArray(fuelRes.value)
            ? fuelRes.value
            : Array.isArray(fuelRes.value?.logs)
            ? fuelRes.value.logs
            : Array.isArray(fuelRes.value?.data?.logs)
            ? fuelRes.value.data.logs
            : Array.isArray(fuelRes.value?.data)
            ? fuelRes.value.data
            : []
          : [];

      const rawExpenses =
        expenseRes.status === 'fulfilled'
          ? Array.isArray(expenseRes.value)
            ? expenseRes.value
            : Array.isArray(expenseRes.value?.expenses)
            ? expenseRes.value.expenses
            : Array.isArray(expenseRes.value?.data?.expenses)
            ? expenseRes.value.data.expenses
            : Array.isArray(expenseRes.value?.data)
            ? expenseRes.value.data
            : []
          : [];

      const fuelExpenses = rawExpenses.filter((e) => {
        const cat = (e.category || '').toUpperCase();
        const title = (e.title || '').toUpperCase();
        const notes = (e.notes || e.description || '').toUpperCase();
        return (
          cat === 'FUEL' ||
          cat === 'TRANSPORT' ||
          cat === 'PETROL' ||
          cat === 'DIESEL' ||
          title.includes('FUEL') ||
          title.includes('PETROL') ||
          notes.includes('FUEL') ||
          notes.includes('PETROL')
        );
      });

      const normalizedFuel = rawFuelList.map((f) => {
        const staffName =
          (typeof f.riderId === 'object' && f.riderId?.name) ||
          f.staffName ||
          f.riderName ||
          (f.vehiclePlate ? `Vehicle ${f.vehiclePlate}` : 'General Delivery');

        return {
          ...f,
          id: f._id || f.id || Date.now(),
          _id: f._id || f.id,
          riderId: typeof f.riderId === 'object' ? f.riderId?._id : f.riderId,
          staffName,
          vehiclePlate: f.vehiclePlate || '',
          shift: f.shift || '',
          date: f.date
            ? typeof f.date === 'string' && f.date.includes('T')
              ? f.date.split('T')[0]
              : String(f.date).slice(0, 10)
            : new Date().toISOString().split('T')[0],
          liters: Number(f.liters || f.quantity) || 0,
          amount: Number(f.costRupees || f.amount || f.cost) || 0,
          distanceKm: Number(f.distanceKm || f.odometerKm || f.mileage) || 0,
          receiptNumber: f.receiptNumber || '',
          notes: f.notes || (f.receiptNumber ? `Receipt: #${f.receiptNumber}` : ''),
          source: 'VEHICLE_LOG',
        };
      });

      // Merge fuel expenses from general finance that aren't already represented in fuel logs
      const additionalFuel = fuelExpenses
        .filter((e) => {
          const expAmt = Number(e.amountRupees || e.amount || 0);
          const expDate = e.date ? String(e.date).slice(0, 10) : '';
          return !normalizedFuel.some(
            (nf) => Math.abs(nf.amount - expAmt) < 1 && nf.date === expDate
          );
        })
        .map((e) => ({
          id: e._id || e.id || `exp-${Date.now()}`,
          _id: e._id || e.id,
          staffName:
            e.authorizedBy ||
            e.title?.replace(/.*(?:for|by|rider)\s+/i, '') ||
            'General Delivery',
          vehiclePlate: '',
          shift: '',
          date: e.date
            ? typeof e.date === 'string' && e.date.includes('T')
              ? e.date.split('T')[0]
              : String(e.date).slice(0, 10)
            : new Date().toISOString().split('T')[0],
          liters: Number(e.liters || (e.amountRupees ? Math.round(e.amountRupees / 280) : 0)),
          amount: Number(e.amountRupees || e.amount || 0),
          distanceKm: Number(e.distanceKm || 0),
          receiptNumber: '',
          notes: e.notes || e.description || e.title || 'Fuel Expense',
          source: 'FINANCE_EXPENSE',
        }));

      setFuelLogs([...normalizedFuel, ...additionalFuel]);
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

    // Sync to backend database VehicleFuelLog + Finance Expense
    try {
      const [fuelRes] = await Promise.allSettled([
        deliveryService.createFuelLog({
          staffName: newLog.staffName,
          date: newLog.date,
          shift: (data.shift || 'MORNING').toUpperCase(),
          vehiclePlate: data.vehiclePlate || 'STANDARD',
          liters: newLog.liters,
          amount: newLog.amount,
          costRupees: newLog.amount,
          distanceKm: newLog.distanceKm,
          notes: newLog.notes,
        }),
        api.finance.createExpense({
          category: 'FUEL',
          title: `Vehicle Fuel (${newLog.staffName})`,
          amountRupees: newLog.amount,
          amount: newLog.amount,
          paymentMethod: 'CASH',
          date: newLog.date,
          scope: 'DELIVERY',
          authorizedBy: newLog.staffName,
          notes: newLog.notes || `${newLog.liters} L fuel for delivery`,
        }),
      ]);

      if (fuelRes.status === 'fulfilled') {
        const created = fuelRes.value?.data || fuelRes.value?.log || fuelRes.value;
        if (created && (created._id || created.id)) {
          const realId = created._id || created.id;
          setFuelLogs((prev) =>
            prev.map((f) => (f.id === newLog.id ? { ...f, _id: realId, id: realId } : f))
          );
        }
      }
    } catch (e) {
      console.warn('Fuel log API sync notice:', e.message);
    }

    return newLog;
  };

  const deleteFuelLog = async (id) => {
    setFuelLogs((prev) => prev.filter((f) => (f._id || f.id) !== id && f.id !== id));
    try {
      await Promise.allSettled([
        deliveryService.deleteFuelLog(id),
        api.finance.deleteExpense(id),
      ]);
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
