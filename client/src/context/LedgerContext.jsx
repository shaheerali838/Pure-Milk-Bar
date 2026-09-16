import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerContext } from './CustomerContext';

const LedgerContext = createContext();
const LEDGER_STORAGE_KEY = 'pure_milk_bar_ledgers';

const DEFAULT_LEDGERS = {
  '1': [
    {
      id: 'txn-1-init',
      date: '2026-08-01',
      description: 'Opening Balance (Khata Start)',
      type: 'OPENING',
      debit: 0,
      credit: 0,
      runningBalance: 1000,
      method: '-',
      notes: 'Initial opening ledger balance',
    },
    {
      id: 'txn-1-01',
      date: '2026-09-01',
      description: 'Daily Milk Delivery (2 L Cow Milk)',
      type: 'DEBIT',
      debit: 480,
      credit: 0,
      runningBalance: 1480,
      method: 'Khata Charge',
      notes: 'Delivered Morning Shift',
    },
    {
      id: 'txn-1-02',
      date: '2026-09-05',
      description: 'Customer Payment Received',
      type: 'CREDIT',
      debit: 0,
      credit: 1000,
      runningBalance: 480,
      method: 'Online Payment',
      notes: 'EasyPaisa TRX #EP98124',
    },
    {
      id: 'txn-1-03',
      date: '2026-09-10',
      description: 'POS Sale: Pure Cow Milk & Dahi',
      type: 'DEBIT',
      debit: 1200,
      credit: 0,
      runningBalance: 1680,
      method: 'Khata Charge',
      notes: 'Counter POS Purchase',
    },
    {
      id: 'txn-1-04',
      date: '2026-09-14',
      description: 'Daily Milk Delivery (6 Days Batch)',
      type: 'DEBIT',
      debit: 2880,
      credit: 0,
      runningBalance: 4560,
      method: 'Khata Charge',
      notes: 'Doorstep batch cycle',
    },
    {
      id: 'txn-1-05',
      date: '2026-09-15',
      description: 'Cash Payment Received at Counter',
      type: 'CREDIT',
      debit: 0,
      credit: 1360,
      runningBalance: 3200,
      method: 'Cash',
      notes: 'Walk-in cash counter settlement',
    },
  ],
  '2': [
    {
      id: 'txn-2-init',
      date: '2026-08-10',
      description: 'Opening Balance',
      type: 'OPENING',
      debit: 0,
      credit: 0,
      runningBalance: 2000,
      method: '-',
      notes: 'Account opened',
    },
    {
      id: 'txn-2-01',
      date: '2026-09-02',
      description: 'Delivery: 3 L Buffalo Milk',
      type: 'DEBIT',
      debit: 780,
      credit: 0,
      runningBalance: 2780,
      method: 'Khata Charge',
      notes: 'Evening delivery',
    },
    {
      id: 'txn-2-02',
      date: '2026-09-08',
      description: 'Bulk Dahi (5 KG)',
      type: 'DEBIT',
      debit: 3500,
      credit: 0,
      runningBalance: 6280,
      method: 'Khata Charge',
      notes: 'Special farm order',
    },
    {
      id: 'txn-2-03',
      date: '2026-09-12',
      description: 'Payment: JazzCash Transfer',
      type: 'CREDIT',
      debit: 0,
      credit: 2000,
      runningBalance: 4280,
      method: 'Online Payment',
      notes: 'JazzCash TRX #JC33421',
    },
    {
      id: 'txn-2-04',
      date: '2026-09-15',
      description: 'Weekly Delivery charges',
      type: 'DEBIT',
      debit: 1520,
      credit: 0,
      runningBalance: 5800,
      method: 'Khata Charge',
      notes: 'Evening batch',
    },
  ],
  '4': [
    {
      id: 'txn-4-init',
      date: '2026-08-20',
      description: 'Opening Balance',
      type: 'OPENING',
      debit: 0,
      credit: 0,
      runningBalance: 5000,
      method: '-',
      notes: 'DHA Phase 5 Residence setup',
    },
    {
      id: 'txn-4-01',
      date: '2026-09-03',
      description: 'Daily Milk Delivery (4 L Mixed Milk x 7 days)',
      type: 'DEBIT',
      debit: 7000,
      credit: 0,
      runningBalance: 12000,
      method: 'Khata Charge',
      notes: 'Weekly milk cycle',
    },
    {
      id: 'txn-4-02',
      date: '2026-09-09',
      description: 'Bank / Online Transfer Received',
      type: 'CREDIT',
      debit: 0,
      credit: 5000,
      runningBalance: 7000,
      method: 'Online Payment',
      notes: 'Meezan Bank Direct',
    },
    {
      id: 'txn-4-03',
      date: '2026-09-15',
      description: 'Daily Milk Delivery (4 L Mixed Milk x 5 days) + Farm Dahi',
      type: 'DEBIT',
      debit: 5400,
      credit: 0,
      runningBalance: 12400,
      method: 'Khata Charge',
      notes: 'Morning shift batch',
    },
  ],
};

export function LedgerProvider({ children }) {
  const { customers, updateCustomer } = useCustomerContext();

  const [ledgers, setLedgers] = useState(() => {
    try {
      const saved = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
      return DEFAULT_LEDGERS;
    } catch (err) {
      console.error('Failed to load ledgers from localStorage:', err);
      return DEFAULT_LEDGERS;
    }
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
    const customer = customers.find((c) => String(c.id) === custId);
    let existingEntries = ledgers[custId] ? [...ledgers[custId]] : [];

    // If no ledger entries exist yet, initialize with customer's opening balance
    if (existingEntries.length === 0 && customer) {
      const initialBal = Number(customer.openingBalance ?? customer.khataBalance) || 0;
      existingEntries.push({
        id: `txn-${customer.id}-init`,
        date: customer.createdAt || new Date().toISOString().split('T')[0],
        description: 'Opening Balance',
        type: 'OPENING',
        debit: 0,
        credit: 0,
        runningBalance: initialBal,
        method: '-',
      });
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
    const customer = customers.find((c) => String(c.id) === custId);
    let existingEntries = ledgers[custId] ? [...ledgers[custId]] : [];

    if (existingEntries.length === 0 && customer) {
      const initialBal = Number(customer.openingBalance ?? customer.khataBalance) || 0;
      existingEntries.push({
        id: `txn-${customer.id}-init`,
        date: customer.createdAt || new Date().toISOString().split('T')[0],
        description: 'Opening Balance',
        type: 'OPENING',
        debit: 0,
        credit: 0,
        runningBalance: initialBal,
        method: '-',
      });
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

    const customer = customers.find((c) => String(c.id) === custId);
    if (customer) {
      const initialBal = Number(customer.openingBalance ?? customer.khataBalance) || 0;
      return [
        {
          id: `txn-${customer.id}-init`,
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
