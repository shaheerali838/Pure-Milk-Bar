import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useStaffContext } from './StaffContext';
import { usePOSContext } from './POSContext';
import { useCustomerContext } from './CustomerContext';
import { useLedgerContext } from './LedgerContext';
import { useExpense } from './ExpenseContext';
import { useDeliveryContext } from './DeliveryContext';

const AuditContext = createContext();

const STORAGE_KEY_AUDIT = 'pure_milk_bar_audit_log';
const STORAGE_KEY_SEEN = 'pure_milk_bar_audit_log_seen';

export function AuditProvider({ children }) {
  // 1. Audit events list persisted in localStorage (starts empty if none)
  const [auditEvents, setAuditEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading audit log from localStorage:', e);
    }
    return [];
  });

  // 2. Seen IDs index persisted in localStorage
  const [seenIds, setSeenIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEEN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.error('Error loading audit seen IDs from localStorage:', e);
    }
    return new Set();
  });

  // Keep ref to avoid stale closures in effects
  const eventsRef = useRef(auditEvents);
  eventsRef.current = auditEvents;

  const seenRef = useRef(seenIds);
  seenRef.current = seenIds;

  // Persist auditEvents on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditEvents));
    } catch (e) {
      console.error('Error saving audit log to localStorage:', e);
    }
  }, [auditEvents]);

  // Persist seenIds on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(Array.from(seenIds)));
    } catch (e) {
      console.error('Error saving audit seen IDs to localStorage:', e);
    }
  }, [seenIds]);

  // Manual event logging function exposed to app
  const logEvent = ({ user = 'System', action = 'Create', module = 'System', detail = '', ipAddress = '—' }) => {
    const nextNum = eventsRef.current.length + 1;
    const eventId = `EVT-${String(nextNum).padStart(6, '0')}`;
    const newEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      user: user || 'System',
      action,
      module,
      detail,
      ipAddress: ipAddress || '—',
    };

    setAuditEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  // 3. Auto-derive audit events by reading existing contexts
  const staffCtx = useStaffContext();
  const staffList = staffCtx?.staffList || [];

  const posCtx = usePOSContext();
  const salesHistory = posCtx?.salesHistory || [];
  const products = posCtx?.products || [];

  const customerCtx = useCustomerContext();
  const customers = customerCtx?.rawCustomers || customerCtx?.customers || [];

  const ledgerCtx = useLedgerContext();
  const ledgers = ledgerCtx?.ledgers || {};

  const expenseCtx = useExpense();
  const expenses = expenseCtx?.expenses || [];

  const deliveryCtx = useDeliveryContext();
  const deliveries = deliveryCtx?.deliveries || [];

  useEffect(() => {
    const newEvents = [];
    const currentSeen = new Set(seenRef.current);
    let nextCount = eventsRef.current.length;

    const generateId = () => {
      nextCount += 1;
      return `EVT-${String(nextCount).padStart(6, '0')}`;
    };

    // A. New sales in salesHistory
    salesHistory.forEach((sale) => {
      const saleKey = `sale_${sale.invoiceId || sale.id}`;
      if (saleKey && !currentSeen.has(saleKey)) {
        currentSeen.add(saleKey);
        const custName = sale.walkinName || sale.customerName || (sale.activeCustomer ? sale.activeCustomer.name : 'Walk-in Customer');
        const netPayable = sale.netPayable !== undefined ? Number(sale.netPayable).toLocaleString() : '0';
        newEvents.push({
          id: generateId(),
          timestamp: sale.timestamp || new Date().toISOString(),
          user: sale.cashierName || 'POS Register',
          action: 'Create',
          module: 'Sales',
          detail: `Invoice ${sale.invoiceId || sale.id} created for ${custName} — Rs. ${netPayable}`,
          ipAddress: '—',
        });
      }
    });

    // B. New staff in staffList
    staffList.forEach((staff) => {
      const staffKey = `staff_${staff.id}`;
      if (staff.id && !currentSeen.has(staffKey)) {
        currentSeen.add(staffKey);
        newEvents.push({
          id: generateId(),
          timestamp: staff.joinedDate ? new Date(staff.joinedDate).toISOString() : new Date().toISOString(),
          user: 'Admin',
          action: 'Create',
          module: 'Staff',
          detail: `Staff member ${staff.name} (${staff.id}) added — ${staff.role || 'Staff'}`,
          ipAddress: '—',
        });
      }
    });

    // C. New customers in customers
    customers.forEach((cust) => {
      const custKey = `cust_${cust.id}`;
      if (cust.id && !currentSeen.has(custKey)) {
        currentSeen.add(custKey);
        newEvents.push({
          id: generateId(),
          timestamp: cust.createdAt || new Date().toISOString(),
          user: 'Admin',
          action: 'Create',
          module: 'Customers',
          detail: `Customer ${cust.name} registered (${cust.phone || 'No phone'})`,
          ipAddress: '—',
        });
      }
    });

    // D. New payments recorded in customer ledgers
    customers.forEach((cust) => {
      const entries = ledgers[String(cust.id)] || [];
      entries.forEach((entry, idx) => {
        const credit = Number(entry.credit) || 0;
        if (credit > 0) {
          const entryKey = `ledger_pay_${cust.id}_${entry.id || idx}_${entry.date || ''}_${credit}`;
          if (!currentSeen.has(entryKey)) {
            currentSeen.add(entryKey);
            newEvents.push({
              id: generateId(),
              timestamp: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
              user: entry.recordedBy || 'Accounts Cashier',
              action: 'Create',
              module: 'Payments',
              detail: `Payment recorded: ${cust.name} — Rs. ${credit.toLocaleString()} (${entry.method || 'Cash'})`,
              ipAddress: '—',
            });
          }
        }
      });
    });

    // E. New expenses in expenses
    expenses.forEach((exp) => {
      const expKey = `exp_${exp.id}`;
      if (exp.id && !currentSeen.has(expKey)) {
        currentSeen.add(expKey);
        const amount = Number(exp.amount || exp.totalCost || 0).toLocaleString();
        newEvents.push({
          id: generateId(),
          timestamp: exp.date ? new Date(exp.date).toISOString() : new Date().toISOString(),
          user: exp.recordedBy || 'Manager',
          action: 'Create',
          module: 'Expenses',
          detail: `Expense logged: ${exp.description || exp.category || 'Farm expense'} — Rs. ${amount}`,
          ipAddress: '—',
        });
      }
    });

    // F. New deliveries in deliveries
    deliveries.forEach((del) => {
      const delKey = `del_${del.id}`;
      if (del.id && !currentSeen.has(delKey)) {
        currentSeen.add(delKey);
        newEvents.push({
          id: generateId(),
          timestamp: del.createdAt || del.date ? new Date(del.date).toISOString() : new Date().toISOString(),
          user: del.riderName || 'Dispatch Officer',
          action: 'Create',
          module: 'Deliveries',
          detail: `Delivery order ${del.id} dispatched to ${del.customerName || del.address || 'Customer'}`,
          ipAddress: '—',
        });
      }
    });

    // G. New products in products
    products.forEach((prod) => {
      const prodKey = `prod_${prod.id || prod.sku}`;
      if ((prod.id || prod.sku) && !currentSeen.has(prodKey)) {
        currentSeen.add(prodKey);
        const price = Number(prod.price || 0).toLocaleString();
        newEvents.push({
          id: generateId(),
          timestamp: new Date().toISOString(),
          user: 'Admin',
          action: 'Create',
          module: 'Products',
          detail: `Product ${prod.name} added — Rs. ${price} (${prod.category || 'Dairy'})`,
          ipAddress: '—',
        });
      }
    });

    if (newEvents.length > 0) {
      setSeenIds(currentSeen);
      setAuditEvents((prev) => [...newEvents.reverse(), ...prev]);
    }
  }, [
    staffList,
    salesHistory,
    products,
    customers,
    ledgers,
    expenses,
    deliveries,
  ]);

  // 4. Computed Metrics
  const totalEvents = auditEvents.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = auditEvents.filter((e) => {
    try {
      return e.timestamp && e.timestamp.startsWith(todayStr);
    } catch {
      return false;
    }
  }).length;

  const criticalCount = auditEvents.filter((e) => e.action === 'Delete').length;

  const distinctUsers = new Set(auditEvents.map((e) => e.user || 'System'));
  const activeUsersCount = distinctUsers.size;

  const metrics = {
    totalEvents,
    todayCount,
    criticalCount,
    activeUsersCount,
  };

  return (
    <AuditContext.Provider
      value={{
        auditEvents,
        metrics,
        logEvent,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAuditContext() {
  const context = useContext(AuditContext);
  if (!context) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      const auditEvents = saved ? JSON.parse(saved) : [];
      return {
        auditEvents,
        metrics: {
          totalEvents: auditEvents.length,
          todayCount: 0,
          criticalCount: 0,
          activeUsersCount: 0,
        },
        logEvent: () => {},
      };
    } catch {
      return {
        auditEvents: [],
        metrics: { totalEvents: 0, todayCount: 0, criticalCount: 0, activeUsersCount: 0 },
        logEvent: () => {},
      };
    }
  }
  return context;
}

export default AuditProvider;
