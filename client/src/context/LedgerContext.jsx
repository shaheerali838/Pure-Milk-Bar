import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerContext } from './CustomerContext';

const LedgerContext = createContext();
const LEDGER_STORAGE_KEY = 'pure_milk_bar_ledgers_v2';

export function LedgerProvider({ children }) {
  const { customers = [], updateCustomer } = useCustomerContext() || {};

  // Initialize with empty ledgers object — strictly no hardcoded mock data
  const [ledgers, setLedgers] = useState(() => {
    try {
      localStorage.removeItem('pure_milk_bar_ledgers');
      const saved = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load ledgers from localStorage:', err);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledgers));
    } catch (err) {
      console.error('Failed to save ledgers to localStorage:', err);
    }
  }, [ledgers]);

  const addLedgerEntry = (
    customerId,
    { description, debit = 0, credit = 0, date, method = 'Cash', notes = '', paymentType = 'partial' }
  ) => {
    const custId = String(customerId);
    const customer = (customers || []).find((c) => String(c.id || c._id) === custId);
    let existingEntries = ledgers[custId] ? [...ledgers[custId]] : [];

    // If no ledger entries exist yet, initialize with customer's opening balance
    if (existingEntries.length === 0 && customer) {
      const initialBal = Number(customer.openingBalance ?? customer.khataBalance) || 0;
      if (initialBal > 0) {
        existingEntries.push({
          id: `txn-${customer.id || customer._id}-init`,
          date: customer.createdAt || new Date().toISOString().split('T')[0],
          description: 'Opening Balance',
          type: 'OPENING',
          debit: 0,
          credit: 0,
          runningBalance: initialBal,
          method: '-',
        });
      }
    }

    const lastRunningBalance =
      existingEntries.length > 0
        ? Number(existingEntries[existingEntries.length - 1].runningBalance) || 0
        : customer
        ? Number(customer.khataBalance) || 0
        : 0;

    const numDebit = Number(debit) || 0;
    const numCredit = Number(credit) || 0;
    const newRunningBalance = Math.max(0, lastRunningBalance + numDebit - numCredit);

    const newEntry = {
      id: `txn-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      description,
      type: numDebit > 0 ? 'DEBIT' : 'CREDIT',
      debit: numDebit,
      credit: numCredit,
      runningBalance: newRunningBalance,
      method: method === 'EasyPaisa' || method === 'JazzCash' ? 'Online Payment' : method,
      notes,
    };

    const updatedLedger = [...existingEntries, newEntry];

    setLedgers((prev) => ({
      ...prev,
      [custId]: updatedLedger,
    }));

    // Update customer's balance in CustomerContext
    if (customer && updateCustomer) {
      updateCustomer({
        ...customer,
        khataBalance: newRunningBalance,
      });
    }
  };

  const settleKhata = (customerId) => {
    const custId = String(customerId);
    const customer = (customers || []).find((c) => String(c.id || c._id) === custId);
    let existingEntries = ledgers[custId] ? [...ledgers[custId]] : [];

    if (existingEntries.length === 0 && customer) {
      const initialBal = Number(customer.openingBalance ?? customer.khataBalance) || 0;
      if (initialBal > 0) {
        existingEntries.push({
          id: `txn-${customer.id || customer._id}-init`,
          date: customer.createdAt || new Date().toISOString().split('T')[0],
          description: 'Opening Balance',
          type: 'OPENING',
          debit: 0,
          credit: 0,
          runningBalance: initialBal,
          method: '-',
        });
      }
    }

    const lastRunningBalance =
      existingEntries.length > 0
        ? Number(existingEntries[existingEntries.length - 1].runningBalance) || 0
        : customer
        ? Number(customer.khataBalance) || 0
        : 0;

    if (lastRunningBalance <= 0) return;

    const settleEntry = {
      id: `txn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: 'Khata Full Settlement & Clearance',
      type: 'CREDIT',
      debit: 0,
      credit: lastRunningBalance,
      runningBalance: 0,
      method: 'Online Payment',
      notes: 'All outstanding dues cleared',
    };

    const updatedLedger = [...existingEntries, settleEntry];

    setLedgers((prev) => ({
      ...prev,
      [custId]: updatedLedger,
    }));

    if (customer && updateCustomer) {
      updateCustomer({
        ...customer,
        khataBalance: 0,
      });
    }
  };

  const getLedgerForCustomer = (customerId) => {
    const custId = String(customerId);
    if (ledgers[custId] && ledgers[custId].length > 0) {
      return ledgers[custId];
    }

    const customer = (customers || []).find((c) => String(c.id || c._id) === custId);
    if (customer) {
      const initialBal = Number(customer.openingBalance ?? customer.khataBalance) || 0;
      if (initialBal > 0) {
        return [
          {
            id: `txn-${customer.id || customer._id}-init`,
            date: customer.createdAt || new Date().toISOString().split('T')[0],
            description: 'Opening Balance',
            type: 'OPENING',
            debit: 0,
            credit: 0,
            runningBalance: initialBal,
            method: '-',
          },
        ];
      }
    }

    return [];
  };

  return (
    <LedgerContext.Provider
      value={{
        ledgers,
        addLedgerEntry,
        settleKhata,
        getLedgerForCustomer,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedgerContext() {
  return useContext(LedgerContext);
}

export default LedgerContext;
