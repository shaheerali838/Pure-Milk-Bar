import React, { createContext, useContext, useState, useEffect } from 'react';

const SourcExpenseContext = createContext(null);

const STORAGE_KEY = 'pure_milk_bar_sourcing_expenses';

// Pre-seeded initial records for realistic procurement operations
const INITIAL_EXPENSES = [
  {
    id: 'EXP-SRC-101',
    date: '2026-09-17',
    category: 'Collection Route Fuel',
    description: 'Milk collection van diesel (Route 1 - Green Meadows)',
    amount: 14500,
    paymentMode: 'Cash on Hand',
    voucherNo: 'VCH-2026-081',
    loggedBy: 'Farhan Ali (Driver)',
    costAttribution: 'Green Meadows Center',
  },
  {
    id: 'EXP-SRC-102',
    date: '2026-09-16',
    category: 'Chilling & Lab Testing',
    description: 'Gerber butyrometer sulfuric acid & alcohol testing solution',
    amount: 8500,
    paymentMode: 'Bank Transfer',
    voucherNo: 'VCH-2026-082',
    loggedBy: 'Imran Khan (Lab Incharge)',
    costAttribution: 'Central Procurement Lab',
  },
  {
    id: 'EXP-SRC-103',
    date: '2026-09-15',
    category: 'Transit Vehicle Maintenance',
    description: 'Chiller vehicle oil change and tire pressure valve replacement',
    amount: 9200,
    paymentMode: 'Cash on Hand',
    voucherNo: 'VCH-2026-083',
    loggedBy: 'Rashid Mehmood (Transport)',
    costAttribution: 'Logistics Hub',
  },
  {
    id: 'EXP-SRC-104',
    date: '2026-09-15',
    category: 'Supplier Loading Handling',
    description: 'Morning shift can loading & dock handling daily wage',
    amount: 4800,
    paymentMode: 'Cash on Hand',
    voucherNo: 'VCH-2026-084',
    loggedBy: 'Bilal Ahmad (Supervisor)',
    costAttribution: 'Dock Station A',
  },
  {
    id: 'EXP-SRC-105',
    date: '2026-09-14',
    category: 'Transit Can Sanitization',
    description: 'Hot steam washing detergent & food-grade disinfectant cans',
    amount: 3600,
    paymentMode: 'Cash on Hand',
    voucherNo: 'VCH-2026-085',
    loggedBy: 'Kamran Siddiqui',
    costAttribution: 'Hygiene Wash Bay',
  },
  {
    id: 'EXP-SRC-106',
    date: '2026-09-13',
    category: 'Milk Collection Logistics',
    description: 'Highway toll taxes & driver transit allowance',
    amount: 2200,
    paymentMode: 'Cash on Hand',
    voucherNo: 'VCH-2026-086',
    loggedBy: 'Farhan Ali (Driver)',
    costAttribution: 'Inter-City Route',
  },
];

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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse sourcing expenses from localStorage', e);
    }
    return INITIAL_EXPENSES;
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
      loggedBy: data.loggedBy || 'System Admin',
      costAttribution: data.costAttribution || 'General Procurement',
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
  const totalSourcingCosts = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const collectionRouteFuel = expenses
    .filter(
      (item) =>
        item.category === 'Collection Route Fuel' ||
        item.category === 'Milk Collection Logistics'
    )
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const chillingLabTesting = expenses
    .filter((item) => item.category === 'Chilling & Lab Testing')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handlingLabor = expenses
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
