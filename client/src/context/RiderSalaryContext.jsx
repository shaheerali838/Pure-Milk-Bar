import React, { createContext, useContext, useState, useEffect } from 'react';

const RiderSalaryContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_rider_salaries';

const defaultSalaries = [];

export function RiderSalaryProvider({ children }) {
  const [salaries, setSalaries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return defaultSalaries;
    } catch (err) {
      console.error('Failed to load rider salaries from localStorage:', err);
      return defaultSalaries;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salaries));
    } catch (err) {
      console.error('Failed to save rider salaries to localStorage:', err);
    }
  }, [salaries]);

  // Get salary record for a specific staff member and month (YYYY-MM)
  const getSalaryRecord = (staffId, month) => {
    return salaries.find(
      (s) => String(s.staffId) === String(staffId) && s.month === month
    );
  };

  // Record a salary payment (Full or Partial, Cash or Online)
  const recordSalaryPayment = ({
    staffId,
    staffName,
    month,
    baseSalary = 25000,
    amountPaid,
    paymentMode = 'CASH',
    notes = '',
  }) => {
    const paymentAmount = Number(amountPaid) || 0;
    const base = Number(baseSalary) || 25000;
    const todayISO = new Date().toISOString().split('T')[0];

    const newPaymentEntry = {
      id: Date.now(),
      date: todayISO,
      amount: paymentAmount,
      paymentMode,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setSalaries((prev) => {
      const existingIndex = prev.findIndex(
        (s) => String(s.staffId) === String(staffId) && s.month === month
      );

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedPayments = [newPaymentEntry, ...(existing.payments || [])];
        const totalPaid = updatedPayments.reduce(
          (sum, p) => sum + (Number(p.amount) || 0),
          0
        );

        let status = 'UNPAID';
        if (totalPaid >= base) {
          status = 'PAID';
        } else if (totalPaid > 0) {
          status = 'PARTIAL';
        }

        const updatedRecord = {
          ...existing,
          baseSalary: base,
          paidAmount: totalPaid,
          status,
          payments: updatedPayments,
          updatedAt: new Date().toISOString(),
        };

        const updated = [...prev];
        updated[existingIndex] = updatedRecord;
        return updated;
      } else {
        let status = 'UNPAID';
        if (paymentAmount >= base) {
          status = 'PAID';
        } else if (paymentAmount > 0) {
          status = 'PARTIAL';
        }

        const newRecord = {
          id: Date.now(),
          staffId,
          staffName: staffName.trim(),
          month,
          baseSalary: base,
          paidAmount: paymentAmount,
          status,
          payments: [newPaymentEntry],
          updatedAt: new Date().toISOString(),
        };

        return [newRecord, ...prev];
      }
    });
  };

  return (
    <RiderSalaryContext.Provider
      value={{
        salaries,
        getSalaryRecord,
        recordSalaryPayment,
      }}
    >
      {children}
    </RiderSalaryContext.Provider>
  );
}

export function useRiderSalaryContext() {
  const context = useContext(RiderSalaryContext);
  if (!context) {
    throw new Error('useRiderSalaryContext must be used within a RiderSalaryProvider');
  }
  return context;
}
