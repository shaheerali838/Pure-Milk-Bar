import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCustomerContext } from './CustomerContext';
import api from '../services/api.js';
import { isDateInFilterRange } from '../utils/dateUtils.js';
import {
  processBillAgainstAdvance,
  processPaymentAgainstKhata,
  recalculateCustomerStatementChronological,
} from '../utils/khataAdvanceHelper';


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

  // If there is a delivery fee discrepancy between orderTotal and product items
  const totalItemsSum = items.reduce((sum, it) => sum + Number(it.subtotal || it.total || (it.quantity * (it.price || it.unitPrice || 0)) || 0), 0);
  const feeDiff = Math.round(Number(entry.orderTotal !== undefined ? entry.orderTotal : numDebit) - totalItemsSum);
  if (items.length > 0 && feeDiff > 0 && !items.some((it) => /delivery|fee|charge/i.test(it.name))) {
    items.push({
      name: 'Doorstep Delivery Fee',
      quantity: 1,
      unit: 'Trip',
      price: feeDiff,
      subtotal: feeDiff,
    });
  }

  const isOpeningEntry =
    entry.type === 'OPENING' ||
    entry.transactionType === 'OPENING' ||
    entry.fulfillmentType === 'Opening Balance' ||
    /Opening Balance/i.test(desc) ||
    /Account Opening/i.test(desc) ||
    /^KV-OP-/i.test(entry.voucherNumber || '') ||
    /^OP-/i.test(entry.referenceTransactionId || '');

  // 2. Fulfillment Type (Walk-in vs Doorstep / COD vs Delivery Shift vs Opening)
  let fulfillmentType = entry.fulfillmentType || '';
  if (isOpeningEntry) {
    fulfillmentType = 'Opening Balance';
  } else if (!fulfillmentType) {
    if (/doorstep/i.test(desc) || /delivery/i.test(desc) || /cod/i.test(desc) || /rider/i.test(desc)) {
      fulfillmentType = /cod/i.test(desc) || /cod/i.test(entry.method || '') ? 'Doorstep (COD)' : 'Doorstep Delivery';
    } else if (/counter/i.test(desc) || /walk-in/i.test(desc) || /store/i.test(desc) || /pos/i.test(desc)) {
      fulfillmentType = 'Walk-in Counter';
    } else if (numCredit > 0) {
      fulfillmentType = 'Payment Clearance';
    } else {
      fulfillmentType = 'Counter Sale';
    }
  }

  // 3. Payment Method & Channel
  let paymentMethod = entry.paymentMethod || entry.method || 'Cash';
  if (isOpeningEntry) {
    paymentMethod = 'Opening Balance';
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
  if (isOpeningEntry) {
    paidAmount = numCredit > 0 ? numCredit : 0;
  } else if (entry.paidAmount !== undefined) {
    paidAmount = Number(entry.paidAmount);
  } else if (numCredit > 0) {
    paidAmount = numCredit;
  }

  let remainingAmount = 0;
  if (isOpeningEntry) {
    remainingAmount = numDebit > 0 ? numDebit : 0;
  } else if (entry.remainingAmount !== undefined) {
    remainingAmount = Number(entry.remainingAmount);
  } else if (numDebit > 0) {
    remainingAmount = Math.max(0, numDebit - paidAmount);
  }

  // Advance fields
  const advanceUsed = Number(entry.advanceUsed || 0);
  const advanceReceived = Number(entry.advanceReceived || 0);
  const advanceBalanceAfter = entry.advanceBalanceAfter !== undefined ? Number(entry.advanceBalanceAfter) : undefined;
  const khataAmount = entry.khataAmount !== undefined ? Number(entry.khataAmount) : undefined;

  // 5. Payment status badge
  let paymentStatus = 'Full Paid';
  if (isOpeningEntry) {
    paymentStatus = numDebit > 0 ? 'Opening Due' : 'Advance Deposit';
  } else if (advanceUsed > 0 && (!khataAmount || khataAmount === 0)) {
    paymentStatus = 'Paid from Advance';
  } else if (advanceUsed > 0 && khataAmount > 0) {
    paymentStatus = 'Partly from Advance';
  } else if (numCredit > 0) {
    paymentStatus = 'Payment Received';
  } else if (paidAmount > 0 && remainingAmount > 0) {
    paymentStatus = `Partial Paid (Rs. ${paidAmount.toLocaleString()})`;
  } else if (remainingAmount > 0 || paymentMethod === 'Khata Credit' || (khataAmount && khataAmount > 0)) {
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
    type: isOpeningEntry ? 'OPENING' : (entry.transactionType || entry.type || (numDebit > 0 ? 'DEBIT' : 'CREDIT')),
    isOpening: isOpeningEntry,
    debit: numDebit,
    credit: numCredit,
    advanceUsed,
    advanceReceived,
    advanceBalanceAfter,
    khataAmount,
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
  const { customers = [], updateCustomer, refreshCustomers } = useCustomerContext() || {};

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

      const customer = (customers || []).find((c) => String(c.id || c._id) === custId || String(c.id || c._id) === validObjectId);
      const openingBal = Number(customer?.openingBalance || customer?.advanceBalance || customer?.currentBalance || customer?.khataBalance || 0);

      let finalEntries = normalized;
      const hasOpeningEntry = finalEntries.some(
        (e) => e.isOpening || e.type === 'OPENING' || /opening/i.test(e.description || '') || /^KV-OP-/i.test(e.voucherNumber || '') || /^OP-/i.test(e.referenceTransactionId || '')
      );

      if (!hasOpeningEntry && openingBal > 0 && customer) {
        const isAdvance =
          Number(customer.advanceBalance) > 0 ||
          String(customer.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
          customer.openingPaymentMethod === 'CASH' ||
          customer.openingPaymentMethod === 'ONLINE';

        finalEntries = [
          ...finalEntries,
          normalizeLedgerEntry({
            id: `KV-OP-${customer.code || customer._id || custId}`,
            date: customer.createdAt
              ? (typeof customer.createdAt === 'string' && customer.createdAt.includes('T') ? customer.createdAt.split('T')[0] : String(customer.createdAt).slice(0, 10))
              : new Date().toISOString().split('T')[0],
            description: isAdvance ? 'Customer Account Initial Advance Deposit' : 'Customer Account Opening Balance (Previous Dues)',
            type: 'OPENING',
            debitAmount: isAdvance ? 0 : openingBal,
            creditAmount: isAdvance ? openingBal : 0,
            debit: isAdvance ? 0 : openingBal,
            credit: isAdvance ? openingBal : 0,
            advanceReceived: isAdvance ? openingBal : 0,
            advanceBalanceAfter: isAdvance ? openingBal : 0,
            runningBalance: isAdvance ? 0 : openingBal,
            fulfillmentType: isAdvance ? 'Advance Deposit' : 'Opening Balance',
            paymentMethod: isAdvance ? 'Advance Cash' : 'Opening Balance',
            orderTotal: openingBal,
            paidAmount: isAdvance ? openingBal : 0,
            remainingAmount: isAdvance ? 0 : openingBal,
          }),
        ];
      }

      // Re-run chronological ledger calculation so advance deductions are perfectly aligned
      const recalculated = recalculateCustomerStatementChronological(finalEntries, customer);
      const computedEntries = recalculated.entries.map((e) => normalizeLedgerEntry(e));

      setLedgers((prev) => ({
        ...prev,
        [custId]: computedEntries,
        ...(validObjectId ? { [validObjectId]: computedEntries } : {}),
      }));

      return computedEntries;
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
    let existingEntries = getLedgerForCustomer(custId) || [];

    const numDebit = Number(debit) || 0;
    const numCredit = Number(credit) || 0;

    const currentStats = getCustomerCalculatedStats(custId);
    const currentAdvance = currentStats.remainingAdvance;
    const currentKhata = currentStats.closingBalance;

    const calculatedOrderTotal = orderTotal !== undefined ? Number(orderTotal) : (numDebit > 0 ? numDebit : numCredit);
    const isOrderOrDebit = numDebit > 0 || (Array.isArray(items) && items.length > 0) || (orderTotal && Number(orderTotal) > 0);

    let advanceUsed = 0;
    let khataAmount = 0;
    let advanceReceived = 0;
    let newAdvanceBalance = currentAdvance;
    let newKhataBalance = currentKhata;

    if (isOrderOrDebit) {
      const bill = calculatedOrderTotal > 0 ? calculatedOrderTotal : numDebit;
      const calc = processBillAgainstAdvance(bill, currentAdvance, currentKhata);
      advanceUsed = calc.advanceUsed;
      khataAmount = calc.khataAmount;
      newAdvanceBalance = calc.advanceBalanceAfter;
      newKhataBalance = calc.newKhataBalance;
    } else if (numCredit > 0) {
      const isExplicitAdvance =
        /advance/i.test(description || '') ||
        /advance/i.test(paymentMethod || '') ||
        /advance/i.test(method || '');
      const calc = processPaymentAgainstKhata(numCredit, currentKhata, currentAdvance, isExplicitAdvance);
      advanceReceived = calc.surplusAdvance;
      newAdvanceBalance = calc.newAdvanceBalance;
      newKhataBalance = calc.newKhataBalance;
    }

    const calculatedPaid = paidAmount !== undefined ? Number(paidAmount) : (numCredit > 0 ? numCredit : advanceUsed);
    const calculatedRemaining = remainingAmount !== undefined ? Number(remainingAmount) : khataAmount;

    const newEntry = normalizeLedgerEntry({
      id: invoiceId || `txn-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      description,
      type: isOrderOrDebit ? 'DEBIT' : 'CREDIT',
      debit: numDebit,
      credit: numCredit,
      advanceUsed,
      khataAmount,
      advanceReceived,
      advanceBalanceAfter: newAdvanceBalance,
      runningBalance: newKhataBalance,
      method: method === 'EasyPaisa' || method === 'JazzCash' ? 'Online Payment' : method,
      notes,
      items: Array.isArray(items) ? items : [],
      orderTotal: calculatedOrderTotal,
      paidAmount: calculatedPaid,
      remainingAmount: calculatedRemaining,
      fulfillmentType: fulfillmentType || (isOrderOrDebit ? (advanceUsed > 0 && khataAmount === 0 ? 'Paid from Advance' : 'Walk-in Counter') : 'Payment Clearance'),
      paymentMethod: paymentMethod || method,
      invoiceId: invoiceId || undefined,
    });

    const rawUpdated = [newEntry, ...existingEntries.filter((e) => e.id !== newEntry.id)];
    const recalculated = recalculateCustomerStatementChronological(rawUpdated, customer);
    const updatedLedger = recalculated.entries.map((e) => normalizeLedgerEntry(e));

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

    // Update customer's balance in CustomerContext local state immediately
    if (customer && updateCustomer) {
      updateCustomer(
        {
          ...customer,
          advanceBalance: newAdvanceBalance,
          khataBalance: newKhataBalance,
          currentBalance: newKhataBalance,
        },
        true
      );
    }

    // Only post to api.finance.addKhataEntry if this is a MANUAL ledger entry (NOT from POS checkout)
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
          fulfillmentType: newEntry.fulfillmentType,
          riderName: newEntry.riderName || null,
          deliveryAddress: newEntry.deliveryAddress || null,
        });
        // Refresh real database statement and customers after server write
        await fetchCustomerLedger(validId);
        if (refreshCustomers) {
          await refreshCustomers();
        }
      } catch (e) {
        console.error('Manual Khata entry API call failed:', e);
      }
    } else if (validId) {
      // For POS orders, trigger refresh from database shortly after order creation
      setTimeout(() => {
        fetchCustomerLedger(validId);
        if (refreshCustomers) refreshCustomers();
      }, 500);
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
      advanceUsed: 0,
      advanceReceived: 0,
      advanceBalanceAfter: customer?.advanceBalance || 0,
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
      updateCustomer(
        {
          ...customer,
          khataBalance: 0,
          currentBalance: 0,
        },
        true
      );
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
        await fetchCustomerLedger(validId);
        if (refreshCustomers) {
          await refreshCustomers();
        }
      }
    } catch (e) {
      console.warn('Settle Khata API sync error:', e);
    }
  };

  const getLedgerForCustomer = useCallback((customerId) => {
    if (!customerId) return [];
    const custId = String(customerId);
    const customer = (customers || []).find((c) => String(c.id || c._id) === custId);

    if (ledgers[custId] && ledgers[custId].length > 0) {
      return ledgers[custId];
    }

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
      const isAdvance = String(customer.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') || customer.openingPaymentMethod === 'CASH' || customer.openingPaymentMethod === 'ONLINE';

      if (initialBal > 0 || (customer.advanceBalance && customer.advanceBalance > 0)) {
        const advBal = Number(customer.advanceBalance || (isAdvance ? initialBal : 0));
        const dueBal = Number(customer.khataBalance ?? (isAdvance ? 0 : initialBal));
        return [
          normalizeLedgerEntry({
            id: `txn-${customer._id || customer.id || custId}-init`,
            date: customer.createdAt ? (typeof customer.createdAt === 'string' && customer.createdAt.includes('T') ? customer.createdAt.split('T')[0] : String(customer.createdAt).slice(0, 10)) : new Date().toISOString().split('T')[0],
            description: isAdvance ? 'Opening Advance Deposit' : 'Opening Balance',
            type: 'OPENING',
            debit: isAdvance ? 0 : dueBal,
            credit: isAdvance ? advBal : 0,
            advanceReceived: isAdvance ? advBal : 0,
            advanceBalanceAfter: advBal,
            runningBalance: dueBal,
            method: '-',
          }),
        ];
      }
    }

    return [];
  }, [customers, ledgers]);

  const isDateInRange = (entryDateStr, dateFilter = 'All Time', startDate = '', endDate = '') => {
    if (!dateFilter || dateFilter === 'All Time' || dateFilter === 'ALL') return true;
    if (!entryDateStr) return false;
    const entryDate = typeof entryDateStr === 'string' ? entryDateStr.slice(0, 10) : new Date(entryDateStr).toISOString().slice(0, 10);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (dateFilter === 'Today' || dateFilter === 'TODAY') {
      return entryDate === todayStr;
    }

    if (dateFilter === 'Weekly' || dateFilter === 'WEEKLY') {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(d.setDate(diff)).toISOString().slice(0, 10);
      return entryDate >= monday && entryDate <= todayStr;
    }

    if (dateFilter === 'Monthly' || dateFilter === 'MONTHLY') {
      const monthStart = todayStr.slice(0, 7) + '-01';
      return entryDate >= monthStart && entryDate <= todayStr;
    }

    if (dateFilter === 'Custom Range' || dateFilter === 'CUSTOM') {
      if (startDate && endDate) {
        return entryDate >= startDate && entryDate <= endDate;
      }
      if (startDate) return entryDate >= startDate;
      if (endDate) return entryDate <= endDate;
      return true;
    }

    return true;
  };

  const getCustomerCalculatedStats = useCallback(
    (customerId, dateFilter = 'All Time', startDate = '', endDate = '') => {
      if (!customerId) {
        return {
          openingBalance: 0,
          openingDate: '',
          isAdvanceOpening: false,
          totalCharged: 0,
          chargedCount: 0,
          totalPaid: 0,
          totalAdvanceUsed: 0,
          paidCount: 0,
          closingBalance: 0,
          remainingAdvance: 0,
          totalAdvanceDeposited: 0,
          consumedAdvance: 0,
          isAdvanceCustomer: false,
          periodCharged: 0,
          periodPaid: 0,
          periodAdvanceDeposited: 0,
          periodAdvanceUsed: 0,
        };
      }

      const custId = String(customerId);
      const customer = (customers || []).find((c) => String(c.id || c._id) === custId);
      const activeEntries = getLedgerForCustomer(customerId) || [];

      // Run chronological recalculator to ensure single source of truth
      const recalc = recalculateCustomerStatementChronological(activeEntries, customer || {});
      const summary = recalc.summary;

      const openingEntry = recalc.entries.find((e) => e.isOpening || e.type === 'OPENING');
      const isAdvanceOpening =
        (openingEntry && Number(openingEntry.advanceReceived) > 0) ||
        String(customer?.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
        /advance/i.test(openingEntry?.description || '') ||
        /advance/i.test(openingEntry?.fulfillmentType || '');

      const openingBalance = openingEntry
        ? Number(openingEntry.credit || openingEntry.debit || openingEntry.orderTotal || customer?.openingBalance || 0)
        : Number(customer?.openingBalance || 0);

      const openingDate = openingEntry
        ? openingEntry.date
        : customer?.createdAt
        ? String(customer.createdAt).slice(0, 10)
        : '';

      const purchaseEntries = recalc.entries.filter(
        (e) => !e.isOpening && e.type !== 'OPENING' && !/opening/i.test(e.description || '')
      );
      const chargedCount = purchaseEntries.length;

      const paymentEntries = recalc.entries.filter(
        (e) =>
          !e.isOpening &&
          e.type !== 'OPENING' &&
          !/opening/i.test(e.description || '') &&
          Number(e.credit) > 0
      );
      const paidCount = paymentEntries.length;

      const remainingAdvance = summary.advanceRemaining !== undefined ? summary.advanceRemaining : Number(customer?.advanceBalance || 0);
      const closingBalance = summary.closingDueBalance !== undefined ? summary.closingDueBalance : Number(customer?.khataBalance ?? customer?.currentBalance ?? 0);
      const totalAdvanceUsed = summary.totalAdvanceUsed || 0;
      const totalAdvanceDeposited = summary.totalAdvanceDeposited || 0;
      const totalCharged = summary.totalDebits || 0;
      const totalPaid = summary.totalCredits || 0;

      // Period-specific activity calculation based on date filter
      const isFiltered = Boolean(dateFilter && dateFilter !== 'All Time' && dateFilter !== 'ALL');
      let periodCharged = 0;
      let periodPaid = 0;
      let periodAdvanceDeposited = 0;
      let periodAdvanceUsed = 0;
      let periodDue = 0;

      recalc.entries.forEach((entry) => {
        const entryDate = entry.date || entry.createdAt;
        if (!isDateInFilterRange(entryDate, dateFilter, startDate, endDate)) return;

        if (!entry.isOpening && entry.type !== 'OPENING') {
          const deb = Number(entry.debitAmount !== undefined ? entry.debitAmount : (entry.debit || 0));
          const cred = Number(entry.creditAmount !== undefined ? entry.creditAmount : (entry.credit || 0));
          const advU = Number(entry.advanceUsed || 0);
          const advR = Number(entry.advanceReceived || 0);
          const duePortion = Number(entry.duePortion !== undefined ? entry.duePortion : Math.max(0, deb - advU));

          periodCharged += deb;
          periodPaid += cred;
          periodAdvanceUsed += advU;
          periodAdvanceDeposited += advR;
          periodDue += duePortion;
        } else if (entry.isOpening) {
          if (entry.advanceReceived) periodAdvanceDeposited += Number(entry.advanceReceived);
          if (entry.debit) periodDue += Number(entry.debit);
        }
      });

      const isAdvanceCustomer = totalAdvanceDeposited > 0 || remainingAdvance > 0 || (isAdvanceOpening && openingBalance > 0);

      return {
        openingBalance,
        openingDate,
        isAdvanceOpening,
        totalCharged: isFiltered ? periodCharged : totalCharged,
        chargedCount,
        totalPaid: isFiltered ? periodPaid : totalPaid,
        totalAdvanceUsed: isFiltered ? periodAdvanceUsed : totalAdvanceUsed,
        realizedPaid: isFiltered ? periodPaid : totalPaid,
        paidCount,
        closingBalance,
        totalAdvanceDeposited,
        remainingAdvance,
        consumedAdvance: totalAdvanceUsed,
        isAdvanceCustomer,
        periodCharged,
        periodPaid,
        periodAdvanceDeposited,
        periodAdvanceUsed,
        periodDue,
      };
    },
    [customers, getLedgerForCustomer]
  );

  const getAllCustomersAggregates = useCallback(
    (dateFilter = 'Today', startDate = '', endDate = '') => {
      const isFiltered = Boolean(dateFilter && dateFilter !== 'All Time' && dateFilter !== 'ALL');
      let totalAllDue = 0;
      let totalAllPaid = 0;
      let totalAllCharged = 0;
      let totalAllAdvanceReceived = 0;
      let totalRemainingAdvance = 0;
      let totalConsumedAdvance = 0;
      let khataAccountsCount = 0;
      let advanceAccountsCount = 0;

      (customers || []).forEach((c) => {
        const stats = getCustomerCalculatedStats(c.id || c._id, dateFilter, startDate, endDate);
        const dueVal = isFiltered ? stats.periodDue : stats.closingBalance;
        totalAllDue += dueVal;
        totalAllPaid += (isFiltered ? stats.periodPaid : stats.totalPaid);
        totalAllCharged += (isFiltered ? stats.periodCharged : stats.totalCharged);
        totalAllAdvanceReceived += stats.totalAdvanceDeposited;
        totalRemainingAdvance += stats.remainingAdvance;
        totalConsumedAdvance += stats.totalAdvanceUsed;

        if (dueVal > 0) {
          khataAccountsCount += 1;
        }
        if (stats.isAdvanceCustomer) {
          advanceAccountsCount += 1;
        }
      });

      return {
        totalAllDue,
        totalAllPaid,
        totalAllCharged,
        totalAllAdvanceReceived,
        totalRemainingAdvance,
        totalConsumedAdvance,
        khataAccountsCount,
        advanceAccountsCount,
        totalCustomersCount: (customers || []).length,
      };
    },
    [customers, getCustomerCalculatedStats]
  );


  return (
    <LedgerContext.Provider
      value={{
        ledgers,
        loadingCustomers,
        fetchCustomerLedger,
        addLedgerEntry,
        settleKhata,
        getLedgerForCustomer,
        getCustomerCalculatedStats,
        getAllCustomersAggregates,
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
