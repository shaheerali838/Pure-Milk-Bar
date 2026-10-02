import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const RiderSalaryContext = createContext();

export function RiderSalaryProvider({ children }) {
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch persisted salary expenses from database API on mount
  const fetchSalaryExpenses = async () => {
    try {
      setIsLoading(true);
      const res = await api.finance.getExpenses({ limit: 500 });
      const rawExpenses = Array.isArray(res)
        ? res
        : Array.isArray(res?.expenses)
        ? res.expenses
        : Array.isArray(res?.data?.expenses)
        ? res.data.expenses
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const salaryExpenses = rawExpenses.filter((e) => {
        const cat = (e.category || '').toUpperCase();
        const title = (e.title || '').toUpperCase();
        return cat === 'SALARIES' || cat === 'SALARY' || title.includes('SALARY');
      });

      if (salaryExpenses.length > 0) {
        setSalaries((prev) => {
          const map = new Map();
          // Seed with existing in-memory records
          prev.forEach((s) => {
            const key = `${s.staffId || s.staffName}-${s.month}`;
            map.set(key, s);
          });

          // Reconcile API expenses
          salaryExpenses.forEach((exp) => {
            const dateStr = exp.date ? String(exp.date).slice(0, 10) : new Date().toISOString().split('T')[0];
            const month = dateStr.slice(0, 7);
            const staffName = exp.authorizedBy || exp.title?.replace(/.*(?:payment|for|rider|to)\s*:?\s*/i, '') || 'Rider';
            const staffId = exp.staffId || exp._id || staffName;
            const key = `${staffId}-${month}`;

            const amount = Number(exp.amountRupees || exp.amount) || 0;
            const baseSalary = 25000;

            const existing = map.get(key) || {
              id: exp._id || exp.id || Date.now(),
              staffId,
              staffName,
              month,
              baseSalary,
              paidAmount: 0,
              status: 'UNPAID',
              payments: [],
            };

            const paymentEntry = {
              id: exp._id || exp.id || Date.now(),
              date: dateStr,
              amount,
              paymentMode: (exp.paymentMethod || 'CASH').toUpperCase(),
              notes: exp.notes || exp.description || exp.title || 'Salary payment',
              createdAt: exp.createdAt || new Date().toISOString(),
            };

            if (!existing.payments.some((p) => p.id === paymentEntry.id || (p.amount === amount && p.date === dateStr))) {
              existing.payments.push(paymentEntry);
              existing.paidAmount += amount;
            }

            if (existing.paidAmount >= existing.baseSalary) {
              existing.status = 'PAID';
            } else if (existing.paidAmount > 0) {
              existing.status = 'PARTIAL';
            }

            map.set(key, existing);
          });

          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Could not fetch salary expenses from backend:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryExpenses();
  }, []);

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

    if (paymentAmount > 0) {
      api.finance.createExpense({
        scope: 'RETAIL',
        category: 'SALARIES',
        title: `Rider Salary Payment: ${staffName || `Rider #${staffId}`}`,
        amount: paymentAmount,
        amountRupees: paymentAmount,
        date: todayISO,
        paymentMethod: paymentMode === 'ONLINE' ? 'ONLINE' : 'CASH',
        notes: notes || `Rider salary payment for ${month}`,
        authorizedBy: 'Admin',
      }).catch((e) => console.warn('Rider salary backend expense sync notice:', e.message));
    }

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
