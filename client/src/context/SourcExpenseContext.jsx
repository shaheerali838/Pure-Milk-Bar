import React, { createContext, useContext, useState, useEffect } from 'react';

const SourcExpenseContext = createContext(null);

const STORAGE_KEY = 'pure_milk_bar_sourcing_expenses';


export const CATEGORY_OPTIONS = [
  'Milk Collection Logistics',
  'Collection Route Fuel',
  'Transit Vehicle Maintenance',
  'Chilling & Lab Testing',
  'Transit Can Sanitization',
  'Supplier Loading Handling',
  'Weighing & Commission',
  'Other Sourcing Costs',
];

export const PAYMENT_MODES = [
  'Cash on Hand',
  'Bank Transfer',
  'Online Wallet / Easypaisa / JazzCash',
  'Cheque',
];

export function SourcExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old seeded dummy expenses if present
          const dummyIds = new Set([
            'EXP-SRC-101',
            'EXP-SRC-102',
            'EXP-SRC-103',
            'EXP-SRC-104',
            'EXP-SRC-105',
            'EXP-SRC-106',
          ]);
          return parsed.filter((item) => !dummyIds.has(item.id));
        }
      }
    } catch (e) {
      console.error('Failed to parse sourcing expenses from localStorage', e);
    }
    return [];
  });

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save sourcing expenses to localStorage', e);
    }
  }, [expenses]);

  // Add Expense
  const addExpense = (data) => {
    const newExpense = {
      id: `EXP-SRC-${Date.now().toString().slice(-4)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'Other Sourcing Costs',
      description: data.description || '',
      amount: Number(data.amount) || 0,
      paymentMode: data.paymentMode || 'Cash on Hand',
      voucherNo: data.voucherNo || `VCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      loggedBy: data.loggedBy ? data.loggedBy.trim() : 'System Admin',
      costAttribution: data.costAttribution ? data.costAttribution.trim() : '',
    };

    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  // Edit / Update Expense
  const updateExpense = (id, updatedData) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedData,
              amount: Number(updatedData.amount ?? item.amount),
            }
          : item
      )
    );
  };

  // Delete Expense
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Dynamic summary metrics
  const safeExpenses = expenses || [];

  const totalSourcingCosts = safeExpenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const collectionRouteFuel = safeExpenses
    .filter(
      (item) =>
        item.category === 'Collection Route Fuel' ||
        item.category === 'Milk Collection Logistics'
    )
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const chillingLabTesting = safeExpenses
    .filter((item) => item.category === 'Chilling & Lab Testing')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handlingLabor = safeExpenses
    .filter(
      (item) =>
        item.category === 'Supplier Loading Handling' ||
        item.category === 'Transit Can Sanitization' ||
        item.category === 'Weighing & Commission'
    )
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const value = {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    totalSourcingCosts,
    collectionRouteFuel,
    chillingLabTesting,
    handlingLabor,
  };

  return (
    <SourcExpenseContext.Provider value={value}>
      {children}
    </SourcExpenseContext.Provider>
  );
}

// Hook for consuming context
export function useSourcExpenseContext() {
  const context = useContext(SourcExpenseContext);
  if (!context) {
    throw new Error(
      'useSourcExpenseContext must be used within a SourcExpenseProvider'
    );
  }
  return context;
}

// Alias for convenience
export const useSourcExpense = useSourcExpenseContext;

export default SourcExpenseContext;
