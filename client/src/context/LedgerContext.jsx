import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCustomerContext } from './CustomerContext';
import api from '@/services/api';

const LedgerContext = createContext();

// Helper to parse and normalize ledger entry details (items, exact amounts, fulfillment channel, payment status)
export function normalizeLedgerEntry(entry) {
  if (!entry) return null;

  const desc = entry.description || '';
  const numDebit = Number(entry.debit !== undefined ? entry.debit : entry.debitAmount) || 0;
  const numCredit = Number(entry.credit !== undefined ? entry.credit : entry.creditAmount) || 0;

  // 1. Structured items or parsed from text
  let items = Array.isArray(entry.items) && entry.items.length > 0 ? entry.items : [];

  if (items.length === 0 && (desc.toLowerCase().includes('buy') || desc.toLowerCase().includes('sale') || desc.toLowerCase().includes('pos') || desc.toLowerCase().includes('milk') || desc.toLowerCase().includes('dahi'))) {
    const cleanDesc = desc
      .replace(/^POS (Counter|Monthly) (Buy|Delivery):\s*/i, '')
      .replace(/^Buy:\s*/i, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const parts = cleanDesc.split(/\s*\+\s*/);
    parts.forEach((p) => {
      const match = p.match(/([\d.]+)\s*(per\s+\w+|kg|ltr|l|liter|bottle|unit|item)?\s*([^(@]+?)(?:\s*\(@Rs\.?\s*([\d.]+)\))?$/i);
      if (match) {
        const qty = parseFloat(match[1]) || 1;
        const unit = match[2] || 'unit';
        const name = match[3].trim() || 'Dairy Product';
        const price = parseFloat(match[4]) || 0;
        items.push({
          name,
          quantity: qty,
          unit,
          price,
          subtotal: Math.round(qty * (price || (numDebit > 0 ? numDebit / qty : 0))),
        });
      }
    });
  }

  // 2. Fulfillment Type (Walk-in vs Doorstep / COD vs Delivery Shift)
  let fulfillmentType = entry.fulfillmentType || '';
  if (!fulfillmentType) {
    if (/doorstep/i.test(desc) || /delivery/i.test(desc) || /cod/i.test(desc) || /rider/i.test(desc)) {
      fulfillmentType = /cod/i.test(desc) || /cod/i.test(entry.method || '') ? 'Doorstep (COD)' : 'Doorstep Delivery';
    } else if (/counter/i.test(desc) || /walk-in/i.test(desc) || /store/i.test(desc) || /pos/i.test(desc)) {
      fulfillmentType = 'Walk-in Counter';
    } else if (entry.type === 'OPENING' || entry.transactionType === 'OPENING') {
      fulfillmentType = 'Opening Balance';
    } else if (numCredit > 0) {
      fulfillmentType = 'Payment Clearance';
    } else {
      fulfillmentType = 'Counter Sale';
    }
  }

  // 3. Payment Method & Channel
  let paymentMethod = entry.paymentMethod || entry.method || 'Cash';
  if (entry.type === 'OPENING' || entry.transactionType === 'OPENING') {
    paymentMethod = 'System Opening';
  } else if (/online/i.test(paymentMethod) || /easypaisa/i.test(paymentMethod) || /jazzcash/i.test(paymentMethod) || /bank/i.test(paymentMethod)) {
    paymentMethod = 'Online Payment';
  } else if (/cod/i.test(paymentMethod) || /cod/i.test(desc)) {
    paymentMethod = 'COD (Cash on Delivery)';
  } else if (/khata/i.test(paymentMethod) || /credit/i.test(paymentMethod)) {
    paymentMethod = 'Khata Credit';
  }

  // 4. Exact Amount Breakdown
  const orderTotal = Number(entry.orderTotal !== undefined ? entry.orderTotal : (numDebit > 0 ? numDebit : numCredit));

  let paidAmount = 0;
  if (entry.paidAmount !== undefined) {
    paidAmount = Number(entry.paidAmount);
  } else if (numCredit > 0) {
    paidAmount = numCredit;
  }

  let remainingAmount = 0;
  if (entry.remainingAmount !== undefined) {
    remainingAmount = Number(entry.remainingAmount);
  } else if (numDebit > 0) {
    remainingAmount = Math.max(0, numDebit - paidAmount);
  }

  // 5. Payment status badge
  let paymentStatus = 'Full Paid';
  if (entry.type === 'OPENING' || entry.transactionType === 'OPENING') {
    paymentStatus = 'Opening Balance';
  } else if (numCredit > 0) {
    paymentStatus = 'Payment Received';
  } else if (paidAmount > 0 && remainingAmount > 0) {
    paymentStatus = `Partial Paid (Rs. ${paidAmount.toLocaleString()})`;
  } else if (remainingAmount > 0 || paymentMethod === 'Khata Credit') {
    paymentStatus = 'Unpaid / Khata Due';
  }

  // 6. Delivery person / Rider and Cashier details
  const riderName =
    entry.riderName ||
    (entry.deliveryMeta && entry.deliveryMeta.riderName) ||
    (desc.match(/rider:\s*([^\],)\n]+)/i)?.[1]?.trim()) ||
    '';

  const deliveryAddress =
    entry.deliveryAddress ||
    (entry.deliveryMeta && entry.deliveryMeta.deliveryAddress) ||
    '';

  const cashierName =
    (typeof entry.cashierId === 'object' && (entry.cashierId?.name || entry.cashierId?.username)) ||
    entry.cashierName ||
    '';

  return {
    ...entry,
    id: entry.id || entry._id || entry.voucherNumber,
    date: entry.date ? (typeof entry.date === 'string' && entry.date.includes('T') ? entry.date.split('T')[0] : String(entry.date).slice(0, 10)) : new Date().toISOString().split('T')[0],
    type: entry.transactionType || entry.type || (numDebit > 0 ? 'DEBIT' : 'CREDIT'),
    debit: numDebit,
    credit: numCredit,
    runningBalance: Number(entry.runningBalance) || 0,
    items,
    fulfillmentType,
    paymentMethod,
    orderTotal,
    paidAmount,
    remainingAmount,
    paymentStatus,
    riderName,
    deliveryAddress,
    cashierName,
    invoiceId: entry.referenceTransactionId || entry.voucherNumber || entry.invoiceId || entry.id,
  };
}

export function LedgerProvider({ children }) {
  const { customers = [], updateCustomer } = useCustomerContext() || {};

  // In-memory ledger entries synced with backend database
  const [ledgers, setLedgers] = useState({});
  const [loadingCustomers, setLoadingCustomers] = useState({});

  // Fetch real statement from backend API for a given customer
  const fetchCustomerLedger = useCallback(async (customerId) => {
    if (!customerId) return [];
    const custId = String(customerId);

    // Resolve ObjectId if custId is alias / mock id
    let validObjectId = custId;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(custId);
    if (!isObjectId) {
      const match = (customers || []).find((c) => String(c.id || c._id) === custId);
      if (match && (match._id || match.id) && /^[0-9a-fA-F]{24}$/.test(String(match._id || match.id))) {
        validObjectId = String(match._id || match.id);
      } else {
        validObjectId = null;
      }
    }

    setLoadingCustomers((prev) => ({
      ...prev,
      [custId]: true,
      ...(validObjectId ? { [validObjectId]: true } : {}),
    }));

    try {
      let rawEntries = [];
      if (validObjectId) {
        const res = await api.finance.getCustomerStatement(validObjectId);
        if (Array.isArray(res)) {
          rawEntries = res;
        } else if (Array.isArray(res?.entries)) {
          rawEntries = res.entries;
        } else if (Array.isArray(res?.data?.entries)) {
          rawEntries = res.data.entries;
        } else if (Array.isArray(res?.data?.data?.entries)) {
          rawEntries = res.data.data.entries;
        } else if (Array.isArray(res?.data)) {
          rawEntries = res.data;
        }
      }

      const normalized = rawEntries.map((e) => normalizeLedgerEntry(e));

      // If customer has a positive current/opening balance but no transactions in DB yet, synthesize opening entry
      const customer = (customers || []).find((c) => String(c.id || c._id) === custId || String(c.id || c._id) === validObjectId);
      const initialBal = Number(customer?.openingBalance ?? customer?.khataBalance ?? customer?.currentBalance) || 0;

      let finalEntries = normalized;
      if (finalEntries.length === 0 && initialBal > 0 && customer) {
        finalEntries = [
          normalizeLedgerEntry({
            id: `txn-${customer._id || customer.id || custId}-init`,
            date: customer.createdAt ? (typeof customer.createdAt === 'string' && customer.createdAt.includes('T') ? customer.createdAt.split('T')[0] : String(customer.createdAt).slice(0, 10)) : new Date().toISOString().split('T')[0],
            description: 'Opening Balance',
            type: 'OPENING',
            debit: 0,
            credit: 0,
            runningBalance: initialBal,
            method: '-',
          }),
        ];
      }

      setLedgers((prev) => ({
        ...prev,
        [custId]: finalEntries,
        ...(validObjectId ? { [validObjectId]: finalEntries } : {}),
      }));

      return finalEntries;
    } catch (err) {
      console.warn(`Failed to fetch ledger statement for customer ${custId}:`, err.message);
      return [];
    } finally {
      setLoadingCustomers((prev) => ({
        ...prev,
        [custId]: false,
        ...(validObjectId ? { [validObjectId]: false } : {}),
      }));
    }
  }, [customers]);

  // Pre-fetch for current customer or on customer changes
  useEffect(() => {
    if (customers && customers.length > 0) {
      customers.forEach((c) => {
        const cId = c._id || c.id;
        if (cId && !ledgers[String(cId)]) {
          fetchCustomerLedger(cId);
        }
      });
    }
  }, [customers, fetchCustomerLedger]);

  const addLedgerEntry = async (
    customerId,
    {
      description,
      debit = 0,
      credit = 0,
      date,
      method = 'Cash',
      notes = '',
      paymentType = 'partial',
      items = [],
      orderTotal,
      paidAmount,
      remainingAmount,
      fulfillmentType,
      paymentMethod,
      invoiceId,
    },
    isPosOrder = false
  ) => {
    const custId = String(customerId);
    const customer = (customers || []).find((c) => String(c.id || c._id) === custId);
    let existingEntries = ledgers[custId] ? [...ledgers[custId]] : [];

    const lastRunningBalance =
      existingEntries.length > 0
        ? Number(existingEntries[existingEntries.length - 1].runningBalance) || 0
        : customer
        ? Number(customer.khataBalance ?? customer.currentBalance) || 0
        : 0;

    const numDebit = Number(debit) || 0;
    const numCredit = Number(credit) || 0;
    const newRunningBalance = Math.max(0, lastRunningBalance + numDebit - numCredit);

    const calculatedOrderTotal = orderTotal !== undefined ? Number(orderTotal) : (numDebit > 0 ? numDebit : numCredit);
    const calculatedPaid = paidAmount !== undefined ? Number(paidAmount) : (numCredit > 0 ? numCredit : 0);
    const calculatedRemaining = remainingAmount !== undefined ? Number(remainingAmount) : (numDebit > 0 ? Math.max(0, numDebit - calculatedPaid) : 0);

    const newEntry = normalizeLedgerEntry({
      id: invoiceId || `txn-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      description,
      type: numDebit > 0 ? 'DEBIT' : 'CREDIT',
      debit: numDebit,
      credit: numCredit,
      runningBalance: newRunningBalance,
      method: method === 'EasyPaisa' || method === 'JazzCash' ? 'Online Payment' : method,
      notes,
      items: Array.isArray(items) ? items : [],
      orderTotal: calculatedOrderTotal,
      paidAmount: calculatedPaid,
      remainingAmount: calculatedRemaining,
      fulfillmentType: fulfillmentType || (numDebit > 0 ? 'Walk-in Counter' : 'Payment Clearance'),
      paymentMethod: paymentMethod || method,
      invoiceId: invoiceId || undefined,
    });

    const updatedLedger = [...existingEntries, newEntry];

    const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
    const validId = isObjectId(customer?._id || customer?.id || custId) ? String(customer?._id || customer?.id || custId) : null;
    const altKey1 = customer?._id ? String(customer._id) : null;
    const altKey2 = customer?.id ? String(customer.id) : null;

    setLedgers((prev) => ({
      ...prev,
      [custId]: updatedLedger,
      ...(altKey1 ? { [altKey1]: updatedLedger } : {}),
      ...(altKey2 ? { [altKey2]: updatedLedger } : {}),
      ...(validId ? { [validId]: updatedLedger } : {}),
    }));

    // Update customer's balance in CustomerContext
    if (customer && updateCustomer) {
      updateCustomer({
        ...customer,
        khataBalance: newRunningBalance,
        currentBalance: newRunningBalance,
      });
    }

    // Only post to api.finance.addKhataEntry if this is a MANUAL ledger entry (NOT from POS checkout)
    // to prevent duplicate debit writes (since backend order.service already creates KhataEntry for POS orders)
    if (!isPosOrder && validId) {
      try {
        await api.finance.addKhataEntry({
          customerId: validId,
          transactionType: numDebit > 0 ? 'DEBIT' : 'CREDIT',
          amount: numDebit > 0 ? numDebit : numCredit,
          description: description || 'Khata Transaction',
          paymentMethod: (() => {
            const pm = String(paymentMethod || method || '').toUpperCase();
            if (['CASH', 'ONLINE', 'ADJUSTMENT', 'CHEQUE', 'KHATA', 'SPLIT', 'COD'].includes(pm)) return pm;
            if (pm.includes('ONLINE') || pm.includes('EASYPAISA') || pm.includes('JAZZCASH') || pm.includes('BANK')) return 'ONLINE';
            if (pm.includes('CHEQUE')) return 'CHEQUE';
            if (pm.includes('COD')) return 'COD';
            if (pm.includes('DEBIT') || pm.includes('KHATA') || pm.includes('CREDIT')) return 'KHATA';
            return numDebit > 0 ? 'KHATA' : 'CASH';
          })(),
          date: date || new Date().toISOString().split('T')[0],
          items: Array.isArray(items) ? items : [],
          orderTotal: calculatedOrderTotal,
          paidAmount: calculatedPaid,
          remainingAmount: calculatedRemaining,
          fulfillmentType,
          riderName: newEntry.riderName || null,
          deliveryAddress: newEntry.deliveryAddress || null,
        });
        // Refresh real database statement after server write
        await fetchCustomerLedger(validId);
      } catch (e) {
        console.warn('Manual Khata entry API call failed:', e);
      }
    } else if (validId) {
      // For POS orders, trigger refresh from database shortly after order creation
      setTimeout(() => fetchCustomerLedger(validId), 500);
    }
  };

  const settleKhata = async (customerId) => {
    const custId = String(customerId);
    const customer = (customers || []).find((c) => String(c.id || c._id) === custId);
    let existingEntries = ledgers[custId] ? [...ledgers[custId]] : [];

    const lastRunningBalance =
      existingEntries.length > 0
        ? Number(existingEntries[existingEntries.length - 1].runningBalance) || 0
        : customer
        ? Number(customer.khataBalance ?? customer.currentBalance) || 0
        : 0;

    if (lastRunningBalance <= 0) return;

    const settleEntry = normalizeLedgerEntry({
      id: `txn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: 'Khata Full Settlement & Clearance',
      type: 'CREDIT',
      debit: 0,
      credit: lastRunningBalance,
      runningBalance: 0,
      method: 'Online Payment',
      notes: 'All outstanding dues cleared',
    });

    const updatedLedger = [...existingEntries, settleEntry];

    setLedgers((prev) => ({
      ...prev,
      [custId]: updatedLedger,
    }));

    if (customer && updateCustomer) {
      updateCustomer({
        ...customer,
        khataBalance: 0,
        currentBalance: 0,
      });
    }

    try {
      const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
      const validId = isObjectId(customer?._id || customer?.id) ? (customer?._id || customer?.id) : null;
      if (validId) {
        await api.finance.addKhataEntry({
          customerId: validId,
          transactionType: 'CREDIT',
          amount: lastRunningBalance,
          description: 'Khata Full Settlement & Clearance',
          paymentMethod: 'CASH',
        });
        fetchCustomerLedger(validId);
      }
    } catch (e) {
      console.warn('Settle Khata API sync error:', e);
    }
  };

  const getLedgerForCustomer = (customerId) => {
    if (!customerId) return [];
    const custId = String(customerId);
    if (ledgers[custId] && ledgers[custId].length > 0) {
      return ledgers[custId];
    }

    const customer = (customers || []).find((c) => String(c.id || c._id) === custId);
    if (customer) {
      const altId1 = customer._id ? String(customer._id) : null;
      const altId2 = customer.id ? String(customer.id) : null;
      if (altId1 && ledgers[altId1] && ledgers[altId1].length > 0) {
        return ledgers[altId1];
      }
      if (altId2 && ledgers[altId2] && ledgers[altId2].length > 0) {
        return ledgers[altId2];
      }

      const initialBal = Number(customer.openingBalance ?? customer.khataBalance ?? customer.currentBalance) || 0;
      if (initialBal > 0) {
        return [
          normalizeLedgerEntry({
            id: `txn-${customer._id || customer.id || custId}-init`,
            date: customer.createdAt ? (typeof customer.createdAt === 'string' && customer.createdAt.includes('T') ? customer.createdAt.split('T')[0] : String(customer.createdAt).slice(0, 10)) : new Date().toISOString().split('T')[0],
            description: 'Opening Balance',
            type: 'OPENING',
            debit: 0,
            credit: 0,
            runningBalance: initialBal,
            method: '-',
          }),
        ];
      }
    }

    return [];
  };

  return (
    <LedgerContext.Provider
      value={{
        ledgers,
        loadingCustomers,
        fetchCustomerLedger,
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
