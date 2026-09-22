import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePOSContext } from './POSContext';
import { useCustomerContext } from './CustomerContext';
import { useLedgerContext } from './LedgerContext';
import { useExpense } from './ExpenseContext';
import { useDeliveryContext } from './DeliveryContext';
import { usePayrollContext } from './PayrollContext';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  // Read external contexts
  const posCtx = usePOSContext();
  const salesHistory = posCtx?.salesHistory || [];

  const customerCtx = useCustomerContext();
  const customers = customerCtx?.rawCustomers || customerCtx?.customers || [];

  const ledgerCtx = useLedgerContext();
  const ledgers = ledgerCtx?.ledgers || {};

  const expenseCtx = useExpense();
  const expenses = expenseCtx?.expenses || [];

  const deliveryCtx = useDeliveryContext();
  const deliveries = deliveryCtx?.deliveries || [];

  const payrollCtx = usePayrollContext();
  const payrollRecords = payrollCtx?.payrollRecords || [];

  // Manual record transaction
  const logTransaction = ({ type, referenceId, channel, amount, description, customerName, cashier }) => {
    const nextNum = transactions.length + 1;
    const txId = `TXN-${String(nextNum).padStart(6, '0')}`;
    const newTx = {
      id: txId,
      referenceId: referenceId || txId,
      type: type || 'Sale', // 'Sale' | 'Payment' | 'Expense' | 'Delivery COD' | 'Adjustment' | 'Salary Payout'
      channel: channel || 'Cash', // 'Cash' | 'Online' | 'COD' | 'Khata'
      amount: Number(amount) || 0,
      description: description || '',
      customerName: customerName || 'Walk-in Customer',
      cashier: cashier || 'System',
      timestamp: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  // Sync / derive transaction ledger
  useEffect(() => {
    const derived = [];

    // 1. POS Sales
    salesHistory.forEach((sale) => {
      const custName = sale.walkinName || sale.customerName || (sale.activeCustomer ? sale.activeCustomer.name : 'Walk-in Customer');
      derived.push({
        id: `TXN-POS-${sale.invoiceId || sale.id}`,
        referenceId: sale.invoiceId || sale.id,
        type: 'Sale',
        channel: sale.paymentMethod === 'online' ? 'Online' : 'Cash',
        amount: Number(sale.netPayable || 0),
        description: `POS Sale invoice ${sale.invoiceId || sale.id}`,
        customerName: custName,
        cashier: sale.cashierName || 'POS Register',
        timestamp: sale.timestamp || new Date().toISOString(),
      });
    });

    // 2. Ledger Payments
    customers.forEach((cust) => {
      const entries = ledgers[String(cust.id)] || [];
      entries.forEach((entry, idx) => {
        const credit = Number(entry.credit) || 0;
        if (credit > 0) {
          derived.push({
            id: `TXN-PAY-${cust.id}-${entry.id || idx}`,
            referenceId: entry.id || `REC-${idx}`,
            type: 'Payment',
            channel: entry.method === 'Bank' || entry.method === 'Online' ? 'Online' : 'Cash',
            amount: credit,
            description: `Khata dues recovery: ${cust.name}`,
            customerName: cust.name,
            cashier: entry.recordedBy || 'Cashier',
            timestamp: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
          });
        }
      });
    });

    // 3. Expenses
    expenses.forEach((exp) => {
      derived.push({
        id: `TXN-EXP-${exp.id}`,
        referenceId: exp.receiptRef || `EXP-${exp.id}`,
        type: 'Expense',
        channel: exp.paymentMethod || 'Cash',
        amount: -(Number(exp.amount || 0)),
        description: exp.description || exp.category || 'Farm Expense',
        customerName: 'Internal Expense',
        cashier: exp.authorizedBy || 'Manager',
        timestamp: exp.date ? new Date(exp.date).toISOString() : new Date().toISOString(),
      });
    });

    // 4. Payroll Disbursements
    payrollRecords.forEach((rec) => {
      derived.push({
        id: `TXN-PAYROLL-${rec.id}`,
        referenceId: rec.id,
        type: 'Salary Payout',
        channel: rec.paymentMethod || 'Cash',
        amount: -(Number(rec.amount || 0)),
        description: `Staff salary disbursement (${rec.monthYear || 'Monthly'})`,
        customerName: `Staff #${rec.staffId}`,
        cashier: 'Accountant',
        timestamp: rec.disbursedAt || new Date().toISOString(),
      });
    });

    if (derived.length > 0) {
      setTransactions((prev) => {
        const manualTx = prev.filter((t) => !t.id.startsWith('TXN-POS-') && !t.id.startsWith('TXN-PAY-') && !t.id.startsWith('TXN-EXP-') && !t.id.startsWith('TXN-PAYROLL-'));
        const combined = [...manualTx, ...derived];
        return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
    }
  }, [salesHistory, customers, ledgers, expenses, deliveries, payrollRecords]);

  // Computed metrics
  const totalVolume = transactions.reduce((acc, t) => acc + (t.amount > 0 ? t.amount : 0), 0);
  const totalInflow = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalOutflow = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const netBalance = totalInflow - totalOutflow;

  const metrics = {
    totalTransactions: transactions.length,
    totalVolume,
    totalInflow,
    totalOutflow,
    netBalance,
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        metrics,
        logTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    return {
      transactions: [],
      metrics: { totalTransactions: 0, totalVolume: 0, totalInflow: 0, totalOutflow: 0, netBalance: 0 },
      logTransaction: () => {},
    };
  }
  return context;
}

export default TransactionProvider;
