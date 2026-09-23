import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

const SourcExpenseContext = createContext(null);

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
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live sourcing expenses from database API
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.finance.getExpenses({ scope: 'SUPPLIER' });
      const list = Array.isArray(res) ? res : res?.expenses || res?.data || [];
      const normalized = list.map((exp) => ({
        ...exp,
        id: exp._id || exp.id || `EXP-SRC-${Date.now()}`,
        date: exp.date ? exp.date.split('T')[0] : new Date().toISOString().split('T')[0],
        category: exp.category || 'Other Sourcing Costs',
        description: exp.description || exp.notes || '',
        amount: Number(exp.amount) || 0,
        paymentMode: exp.paymentMethod === 'ONLINE' ? 'Online Wallet / Easypaisa / JazzCash' : exp.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash on Hand',
        voucherNo: exp.voucherNo || `VCH-${Date.now().toString().slice(-4)}`,
        loggedBy: exp.authorizedBy || 'System Admin',
        costAttribution: exp.costAttribution || '',
      }));
      setExpenses(normalized);
    } catch (err) {
      console.warn('Failed to load sourcing expenses from database API:', err.message);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Add Expense
  const addExpense = async (data) => {
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

    // Sync to backend database
    try {
      await api.finance.createExpense({
        scope: 'SUPPLIER',
        category: data.category || 'SUPPLIER_PROCUREMENT',
        amount: Number(data.amount) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || data.category || '',
        paymentMethod: ['Bank Transfer'].includes(data.paymentMode)
          ? 'BANK_TRANSFER'
          : ['Cheque'].includes(data.paymentMode)
          ? 'CHEQUE'
          : data.paymentMode?.includes('Online')
          ? 'ONLINE'
          : 'CASH',
        authorizedBy: data.loggedBy || 'System Admin',
      });
    } catch (e) {
      console.warn('Sourcing expense API backend sync skipped:', e.message);
    }

    return newExpense;
  };

  // Edit / Update Expense
  const updateExpense = async (id, updatedData) => {
    setExpenses((prev) =>
      prev.map((item) =>
        (item._id || item.id) === id || item.id === id
          ? {
              ...item,
              ...updatedData,
              amount: Number(updatedData.amount ?? item.amount),
            }
          : item
      )
    );
    try {
      await api.finance.updateExpense(id, {
        amountRupees: Number(updatedData.amount),
        category: updatedData.category,
        notes: updatedData.description || updatedData.notes,
      });
    } catch (e) {
      console.warn('Sourcing expense update API sync skipped:', e.message);
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((item) => (item._id || item.id) !== id && item.id !== id));
    try {
      await api.finance.deleteExpense(id);
    } catch (e) {
      console.warn('Sourcing expense delete API sync skipped:', e.message);
    }
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
