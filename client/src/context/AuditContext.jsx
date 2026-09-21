import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTransactionContext } from './TransactionContext';
import { useStaffContext } from './StaffContext';
import { useCustomerContext } from './CustomerContext';
import { useAnimalContext } from './AnimalContext';
import { useExpense } from './ExpenseContext';
import { usePOSContext } from './POSContext';
import { useDeliveryContext } from './DeliveryContext';
import { usePayrollContext } from './PayrollContext';
import financeService from '@/services/financeService';

const AuditContext = createContext();

export function AuditProvider({ children }) {
  const [auditEvents, setAuditEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live audit logs from backend
  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const data = await financeService.getAuditLogs();
        const list = Array.isArray(data) ? data : data?.logs || [];
        setAuditEvents(list.map((e) => ({ ...e, id: e._id || e.id })));
      } catch (err) {
        console.warn('Audit logs API skipped or empty:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const [seenIds, setSeenIds] = useState(() => new Set());

  const eventsRef = useRef(auditEvents);
  eventsRef.current = auditEvents;

  const seenRef = useRef(seenIds);
  seenRef.current = seenIds;

  // Manual event logging function
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

    // Dispatch to API
    financeService.logAuditEvent(newEvent).catch((e) =>
      console.warn('Failed to persist audit event via API:', e)
    );

    return newEvent;
  };

  // 3. Connect to all application contexts
  const txCtx = useTransactionContext();
  const transactions = txCtx?.transactions || [];

  const staffCtx = useStaffContext();
  const staffList = staffCtx?.staffList || [];

  const customerCtx = useCustomerContext();
  const customers = customerCtx?.rawCustomers || customerCtx?.customers || [];

  const animalCtx = useAnimalContext();
  const animals = animalCtx?.animals || [];

  const expenseCtx = useExpense();
  const expenses = expenseCtx?.expenses || [];

  const posCtx = usePOSContext();
  const salesHistory = posCtx?.salesHistory || [];

  const deliveryCtx = useDeliveryContext();
  const deliveries = deliveryCtx?.deliveries || [];

  const payrollCtx = usePayrollContext();
  const payrollRecords = payrollCtx?.payrollRecords || [];

  // Previous snapshots refs for diffing (Create, Update, Delete)
  const prevStaffRef = useRef(null);
  const prevAnimalsRef = useRef(null);
  const prevExpensesRef = useRef(null);
  const prevCustomersRef = useRef(null);
  const prevSalesRef = useRef(null);
  const prevDeliveriesRef = useRef(null);
  const prevPayrollRef = useRef(null);

  useEffect(() => {
    const newEvents = [];
    const currentSeen = new Set(seenRef.current);
    let nextCount = eventsRef.current.length;

    const generateId = () => {
      nextCount += 1;
      return `EVT-${String(nextCount).padStart(6, '0')}`;
    };

    // A. Staff Tracking (Create, Update, Delete)
    if (prevStaffRef.current !== null) {
      const prevMap = new Map(prevStaffRef.current.map((s) => [s.id, s]));
      const currMap = new Map(staffList.map((s) => [s.id, s]));

      // Deletes
      prevStaffRef.current.forEach((oldStaff) => {
        if (!currMap.has(oldStaff.id)) {
          newEvents.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            user: oldStaff.name || 'Admin',
            action: 'Delete',
            module: 'Staff',
            detail: `Staff member removed: ${oldStaff.name} (${oldStaff.id} - ${oldStaff.role})`,
            ipAddress: '—',
          });
        }
      });

      // Updates
      staffList.forEach((newStaff) => {
        const old = prevMap.get(newStaff.id);
        if (old) {
          const changed =
            old.name !== newStaff.name ||
            old.role !== newStaff.role ||
            old.monthlySalary !== newStaff.monthlySalary ||
            old.shift !== newStaff.shift ||
            old.status !== newStaff.status;
          if (changed) {
            newEvents.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              user: newStaff.name || 'Admin',
              action: 'Update',
              module: 'Staff',
              detail: `Staff profile modified: ${newStaff.name} (${newStaff.role}, Salary: Rs. ${Number(newStaff.monthlySalary).toLocaleString()}, Shift: ${newStaff.shift})`,
              ipAddress: '—',
            });
          }
        }
      });
    }

    // New Staff Adds
    staffList.forEach((staff) => {
      const key = `staff_${staff.id}`;
      if (!currentSeen.has(key)) {
        currentSeen.add(key);
        newEvents.push({
          id: generateId(),
          timestamp: staff.joinedDate ? new Date(staff.joinedDate).toISOString() : new Date().toISOString(),
          user: staff.name || 'Admin',
          action: 'Create',
          module: 'Staff',
          detail: `Staff member registered: ${staff.name} (${staff.id} - ${staff.role})`,
          ipAddress: '—',
        });
      }
    });
    prevStaffRef.current = staffList;

    // B. Animals / Farm Herd Tracking (Create, Update, Delete)
    if (prevAnimalsRef.current !== null) {
      const prevMap = new Map(prevAnimalsRef.current.map((a) => [a.id, a]));
      const currMap = new Map(animals.map((a) => [a.id, a]));

      // Deletes
      prevAnimalsRef.current.forEach((oldAnimal) => {
        if (!currMap.has(oldAnimal.id)) {
          newEvents.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            user: 'Farm Manager',
            action: 'Delete',
            module: 'Farm & Herd',
            detail: `Cattle removed from registry: Tag ${oldAnimal.tag || oldAnimal.id} (${oldAnimal.species})`,
            ipAddress: '—',
          });
        }
      });

      // Updates
      animals.forEach((newAnimal) => {
        const old = prevMap.get(newAnimal.id);
        if (old) {
          const changed =
            old.lactationStatus !== newAnimal.lactationStatus ||
            old.morningYield !== newAnimal.morningYield ||
            old.eveningYield !== newAnimal.eveningYield ||
            old.healthStatus !== newAnimal.healthStatus;
          if (changed) {
            newEvents.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              user: 'Herdsman',
              action: 'Update',
              module: 'Farm & Herd',
              detail: `Cattle data updated: Tag ${newAnimal.tag} — Status: ${newAnimal.lactationStatus}, Yield: ${newAnimal.totalDailyYield || '—'}`,
              ipAddress: '—',
            });
          }
        }
      });
    }

    // New Animals Adds
    animals.forEach((animal) => {
      const key = `animal_${animal.id || animal.tag}`;
      if (!currentSeen.has(key)) {
        currentSeen.add(key);
        newEvents.push({
          id: generateId(),
          timestamp: animal.acquisitionDate ? new Date(animal.acquisitionDate).toISOString() : new Date().toISOString(),
          user: 'Farm Manager',
          action: 'Create',
          module: 'Farm & Herd',
          detail: `New Cattle registered: Tag ${animal.tag} (${animal.species}) — Status: ${animal.lactationStatus}`,
          ipAddress: '—',
        });
      }
    });
    prevAnimalsRef.current = animals;

    // C. Farm Expenses Tracking (Create, Update, Delete)
    if (prevExpensesRef.current !== null) {
      const prevMap = new Map(prevExpensesRef.current.map((e) => [e.id, e]));
      const currMap = new Map(expenses.map((e) => [e.id, e]));

      // Deletes
      prevExpensesRef.current.forEach((oldExp) => {
        if (!currMap.has(oldExp.id)) {
          newEvents.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            user: 'Accountant',
            action: 'Delete',
            module: 'Expenses',
            detail: `Expense cancelled/deleted: Rs. ${Number(oldExp.amount).toLocaleString()} — ${oldExp.category}`,
            ipAddress: '—',
          });
        }
      });

      // Updates
      expenses.forEach((newExp) => {
        const old = prevMap.get(newExp.id);
        if (old) {
          const changed =
            old.amount !== newExp.amount ||
            old.category !== newExp.category ||
            old.description !== newExp.description;
          if (changed) {
            newEvents.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              user: 'Accountant',
              action: 'Update',
              module: 'Expenses',
              detail: `Expense updated: ${newExp.category} — New Amount: Rs. ${Number(newExp.amount).toLocaleString()}`,
              ipAddress: '—',
            });
          }
        }
      });
    }

    // New Expenses
    expenses.forEach((exp) => {
      const key = `expense_${exp.id}`;
      if (!currentSeen.has(key)) {
        currentSeen.add(key);
        newEvents.push({
          id: generateId(),
          timestamp: exp.date ? new Date(exp.date).toISOString() : new Date().toISOString(),
          user: exp.authorizedBy || 'Accountant',
          action: 'Create',
          module: 'Expenses',
          detail: `Farm Expense logged: Rs. ${Number(exp.amount).toLocaleString()} — ${exp.category} (${exp.description || ''})`,
          ipAddress: '—',
        });
      }
    });
    prevExpensesRef.current = expenses;

    // D. Customers Tracking (Create, Update)
    if (prevCustomersRef.current !== null) {
      const prevMap = new Map(prevCustomersRef.current.map((c) => [c.id, c]));
      customers.forEach((newCust) => {
        const old = prevMap.get(newCust.id);
        if (old) {
          const changed =
            old.name !== newCust.name ||
            old.phone !== newCust.phone ||
            old.khataBalance !== newCust.khataBalance ||
            old.status !== newCust.status;
          if (changed) {
            newEvents.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              user: 'Cashier',
              action: 'Update',
              module: 'Customers',
              detail: `Customer account updated: ${newCust.name} (Khata Balance: Rs. ${Number(newCust.khataBalance).toLocaleString()})`,
              ipAddress: '—',
            });
          }
        }
      });
    }

    // New Customers
    customers.forEach((cust) => {
      const key = `cust_${cust.id}`;
      if (!currentSeen.has(key)) {
        currentSeen.add(key);
        newEvents.push({
          id: generateId(),
          timestamp: cust.createdAt ? new Date(cust.createdAt).toISOString() : new Date().toISOString(),
          user: 'Cashier',
          action: 'Create',
          module: 'Customers',
          detail: `Customer profile registered: ${cust.name} (${cust.phone || 'No phone'})`,
          ipAddress: '—',
        });
      }
    });
    prevCustomersRef.current = customers;

    // E. POS Sales Invoices
    salesHistory.forEach((sale) => {
      const saleId = sale.invoiceId || sale.id;
      const key = `pos_sale_${saleId}`;
      if (!currentSeen.has(key)) {
        currentSeen.add(key);
        const custName = sale.walkinName || sale.customerName || (sale.activeCustomer ? sale.activeCustomer.name : 'Counter Walk-in');
        newEvents.push({
          id: generateId(),
          timestamp: sale.timestamp || new Date().toISOString(),
          user: sale.cashierName || 'POS Register',
          action: 'Create',
          module: 'Sales',
          detail: `Sale Invoice #${saleId} completed: Rs. ${Number(sale.netPayable || 0).toLocaleString()} (${custName})`,
          ipAddress: '—',
        });
      }
    });

    // F. Deliveries
    deliveries.forEach((del) => {
      const key = `del_${del.id}`;
      if (!currentSeen.has(key)) {
        currentSeen.add(key);
        newEvents.push({
          id: generateId(),
          timestamp: del.date ? new Date(del.date).toISOString() : new Date().toISOString(),
          user: del.riderName || 'Delivery Dispatch',
          action: 'Create',
          module: 'Delivery',
          detail: `Delivery dispatch recorded: ${del.customerName || 'Customer'} — ${del.status || 'Pending'}`,
          ipAddress: '—',
        });
      }
    });

    // G. Payroll Disbursements
    payrollRecords.forEach((rec) => {
      const key = `payroll_${rec.id}`;
      if (!currentSeen.has(key)) {
        currentSeen.add(key);
        const staffMem = staffList.find((s) => s.id === rec.staffId);
        const staffName = staffMem?.name || `Staff #${rec.staffId}`;
        newEvents.push({
          id: generateId(),
          timestamp: rec.disbursedAt || new Date().toISOString(),
          user: staffName,
          action: 'Create',
          module: 'Payroll',
          detail: `Salary disbursed for ${staffName}: Rs. ${Number(rec.amount).toLocaleString()} (${rec.paymentMethod})`,
          ipAddress: '—',
        });
      }
    });

    if (newEvents.length > 0) {
      setSeenIds(currentSeen);
      setAuditEvents((prev) => [...newEvents.reverse(), ...prev]);
    }
  }, [transactions, staffList, customers, animals, expenses, salesHistory, deliveries, payrollRecords]);

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
    return {
      auditEvents: [],
      metrics: { totalEvents: 0, todayCount: 0, criticalCount: 0, activeUsersCount: 0 },
      logEvent: () => {},
    };
  }
  return context;
}

export default AuditProvider;

