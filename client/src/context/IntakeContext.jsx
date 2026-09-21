import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const IntakeContext = createContext(null);

const STORAGE_KEY = 'pure_milk_bar_intake_records_v3';
const LEGACY_STORAGE_KEYS = [
  'pure_milk_bar_intake_records_v2',
  'pure_milk_bar_intake_records_v1',
  'pure_milk_bar_intake_records',
];

export function IntakeProvider({ children }) {
  // Load from LocalStorage - STRICT: Always preserve all saved user intake logs
  const [intakeLogs, setIntakeLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check legacy keys in case logs were stored in an earlier version
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacySaved = localStorage.getItem(legacyKey);
        if (legacySaved) {
          const parsed = JSON.parse(legacySaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    } catch (err) {
      console.error('Error loading intake logs from localStorage:', err);
    }
    return [];
  });

  // Sync to LocalStorage whenever intakeLogs updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(intakeLogs));
    } catch (err) {
      console.error('Error saving intake logs to localStorage:', err);
    }
  }, [intakeLogs]);

  // 1. Add Single Intake Record
  const addIntake = (newRecord) => {
    const existingIds = intakeLogs
      .map((l) => parseInt(String(l.id).replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 900;
    const nextId = `INT-${maxId + 1}`;
    const qty = parseFloat(newRecord.quantity) || 0;
    const rate = parseFloat(newRecord.ratePerLiter) || 220;
    const cost = parseFloat((qty * rate).toFixed(2));
    const fatVal = parseFloat(newRecord.fat) || 4.5;
    const lrVal = parseFloat(newRecord.lr) || 28.0;
    const snfVal = parseFloat(((lrVal / 4) + (0.25 * fatVal) + 0.35).toFixed(2));

    let paid = 0;
    if (newRecord.paidAmount !== undefined && newRecord.paidAmount !== '') {
      paid = parseFloat(newRecord.paidAmount) || 0;
    } else if (newRecord.settlement === 'Paid') {
      paid = cost;
    } else if (newRecord.settlement === 'Partial') {
      paid = parseFloat((cost * 0.5).toFixed(2));
    }
    paid = Math.min(cost, Math.max(0, paid));
    const pending = parseFloat(Math.max(0, cost - paid).toFixed(2));

    let settlement = newRecord.settlement || 'Pending';
    if (cost > 0 && pending <= 0) {
      settlement = 'Paid';
    } else if (paid > 0 && pending > 0) {
      settlement = 'Partial';
    } else if (paid === 0) {
      settlement = 'Pending';
    }

    const entry = {
      id: nextId,
      date: newRecord.date || new Date().toISOString().split('T')[0],
      time: newRecord.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      supplierId: newRecord.supplierId || '',
      supplierName: newRecord.supplierName || 'Unknown Supplier',
      area: newRecord.area || '',
      shift: newRecord.shift || 'Morning',
      quantity: qty,
      ratePerLiter: rate,
      totalCost: cost,
      paidAmount: paid,
      pendingAmount: pending,
      fat: fatVal,
      lr: lrVal,
      snf: snfVal,
      settlement,
      receivedBy: newRecord.receivedBy || 'Staff Receiver',
      notes: newRecord.notes || '',
    };

    setIntakeLogs((prev) => [entry, ...prev]);
    return entry;
  };

  // 2. Add Batch Shift Intake Records
  const addBatchIntake = (batchRecords) => {
    if (!Array.isArray(batchRecords) || batchRecords.length === 0) return;

    const existingIds = intakeLogs
      .map((l) => parseInt(String(l.id).replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    let currentMax = existingIds.length > 0 ? Math.max(...existingIds) : 900;

    const formattedBatch = batchRecords.map((rec) => {
      currentMax += 1;
      const nextId = `INT-${currentMax}`;
      const qty = parseFloat(rec.quantity) || 0;
      const rate = parseFloat(rec.ratePerLiter) || 220;
      const cost = parseFloat((qty * rate).toFixed(2));
      const fatVal = parseFloat(rec.fat) || 4.5;
      const lrVal = parseFloat(rec.lr) || 28.0;
      const snfVal = parseFloat(((lrVal / 4) + (0.25 * fatVal) + 0.35).toFixed(2));

      let paid = 0;
      if (rec.paidAmount !== undefined && rec.paidAmount !== '') {
        paid = parseFloat(rec.paidAmount) || 0;
      } else if (rec.settlement === 'Paid') {
        paid = cost;
      } else if (rec.settlement === 'Partial') {
        paid = parseFloat((cost * 0.5).toFixed(2));
      }
      paid = Math.min(cost, Math.max(0, paid));
      const pending = parseFloat(Math.max(0, cost - paid).toFixed(2));

      let settlement = rec.settlement || 'Pending';
      if (cost > 0 && pending <= 0) {
        settlement = 'Paid';
      } else if (paid > 0 && pending > 0) {
        settlement = 'Partial';
      } else if (paid === 0) {
        settlement = 'Pending';
      }

      return {
        id: nextId,
        date: rec.date || new Date().toISOString().split('T')[0],
        time: rec.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        supplierId: rec.supplierId || '',
        supplierName: rec.supplierName || 'Supplier',
        area: rec.area || '',
        shift: rec.shift || 'Morning',
        quantity: qty,
        ratePerLiter: rate,
        totalCost: cost,
        paidAmount: paid,
        pendingAmount: pending,
        fat: fatVal,
        lr: lrVal,
        snf: snfVal,
        settlement,
        receivedBy: rec.receivedBy || 'Shift Supervisor',
        notes: rec.notes || 'Bulk shift entry',
      };
    });

    setIntakeLogs((prev) => [...formattedBatch, ...prev]);
  };

  // 3. Update Existing Intake Record
  const updateIntake = (id, updatedFields) => {
    setIntakeLogs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const qty =
            updatedFields.quantity !== undefined
              ? parseFloat(updatedFields.quantity) || 0
              : item.quantity;
          const rate =
            updatedFields.ratePerLiter !== undefined
              ? parseFloat(updatedFields.ratePerLiter) || 0
              : item.ratePerLiter;
          const cost = parseFloat((qty * rate).toFixed(2));
          const fatVal =
            updatedFields.fat !== undefined
              ? parseFloat(updatedFields.fat) || item.fat
              : item.fat;
          const lrVal =
            updatedFields.lr !== undefined
              ? parseFloat(updatedFields.lr) || item.lr
              : item.lr;
          const snfVal = parseFloat(((lrVal / 4) + (0.25 * fatVal) + 0.35).toFixed(2));

          let paid = item.paidAmount !== undefined ? item.paidAmount : (item.settlement === 'Paid' ? cost : item.settlement === 'Partial' ? cost * 0.5 : 0);
          if (updatedFields.paidAmount !== undefined && updatedFields.paidAmount !== '') {
            paid = parseFloat(updatedFields.paidAmount) || 0;
          } else if (updatedFields.settlement === 'Paid') {
            paid = cost;
          } else if (updatedFields.settlement === 'Pending') {
            paid = 0;
          } else if (updatedFields.settlement === 'Partial' && paid === 0) {
            paid = parseFloat((cost * 0.5).toFixed(2));
          }
          paid = Math.min(cost, Math.max(0, paid));
          const pending = parseFloat(Math.max(0, cost - paid).toFixed(2));

          let settlement = updatedFields.settlement || item.settlement || 'Pending';
          if (cost > 0 && pending <= 0) {
            settlement = 'Paid';
          } else if (paid > 0 && pending > 0) {
            settlement = 'Partial';
          } else if (paid === 0) {
            settlement = 'Pending';
          }

          return {
            ...item,
            ...updatedFields,
            quantity: qty,
            ratePerLiter: rate,
            totalCost: cost,
            paidAmount: paid,
            pendingAmount: pending,
            settlement,
            fat: fatVal,
            lr: lrVal,
            snf: snfVal,
          };
        }
        return item;
      })
    );
  };

  // 4. Update settlement status for a single batch ('Paid' | 'Pending' | 'Partial')
  const updateBatchSettlement = (id, newStatus) => {
    setIntakeLogs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const cost = item.totalCost || 0;
          const paid = newStatus === 'Paid' ? cost : newStatus === 'Partial' ? cost * 0.5 : 0;
          const pending = Math.max(0, cost - paid);
          return {
            ...item,
            settlement: newStatus,
            paidAmount: paid,
            pendingAmount: pending,
          };
        }
        return item;
      })
    );
  };

  // 5. Settle all pending batches for a specific supplier
  const settleAllBatchesForSupplier = (supplierId, supplierName) => {
    setIntakeLogs((prev) =>
      prev.map((item) => {
        const matchesId = supplierId && item.supplierId === supplierId;
        const matchesName =
          supplierName &&
          item.supplierName &&
          (item.supplierName.toLowerCase() === supplierName.toLowerCase() ||
            item.supplierName.toLowerCase().includes(supplierName.toLowerCase()) ||
            supplierName.toLowerCase().includes(item.supplierName.toLowerCase()));

        if ((matchesId || matchesName) && item.settlement !== 'Paid') {
          const cost = item.totalCost || 0;
          return {
            ...item,
            settlement: 'Paid',
            paidAmount: cost,
            pendingAmount: 0,
          };
        }
        return item;
      })
    );
  };

  // 5b. Settle pending batches for a supplier up to a specific amount (FIFO: partial or full)
  const settleBatchesWithAmount = (supplierId, supplierName, amount) => {
    let remainingToPay = parseFloat(amount) || 0;
    if (remainingToPay <= 0) return;

    setIntakeLogs((prev) =>
      prev.map((item) => {
        if (remainingToPay <= 0) return item;

        const matchesId = supplierId && item.supplierId === supplierId;
        const matchesName =
          supplierName &&
          item.supplierName &&
          (item.supplierName.toLowerCase() === supplierName.toLowerCase() ||
            item.supplierName.toLowerCase().includes(supplierName.toLowerCase()) ||
            supplierName.toLowerCase().includes(item.supplierName.toLowerCase()));

        if ((matchesId || matchesName) && item.settlement !== 'Paid') {
          const qty = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.ratePerLiter) || 0;
          const cost = parseFloat(item.totalCost) || (qty * rate);
          const currentPaid =
            item.paidAmount !== undefined && item.paidAmount !== ''
              ? parseFloat(item.paidAmount) || 0
              : item.settlement === 'Partial'
              ? cost * 0.5
              : 0;
          const pending = Math.max(0, cost - currentPaid);

          if (pending <= 0) {
            return {
              ...item,
              settlement: 'Paid',
              paidAmount: cost,
              pendingAmount: 0,
            };
          }

          if (remainingToPay >= pending) {
            remainingToPay -= pending;
            return {
              ...item,
              settlement: 'Paid',
              paidAmount: cost,
              pendingAmount: 0,
            };
          } else {
            const newPaid = parseFloat((currentPaid + remainingToPay).toFixed(2));
            const newPending = Math.max(0, parseFloat((cost - newPaid).toFixed(2)));
            remainingToPay = 0;
            return {
              ...item,
              settlement: 'Partial',
              paidAmount: newPaid,
              pendingAmount: newPending,
            };
          }
        }
        return item;
      })
    );
  };

  // 6. Delete Intake Record
  const deleteIntake = (id) => {
    setIntakeLogs((prev) => prev.filter((item) => item.id !== id));
  };

  // 7. Reset Intake Data
  const resetIntakeToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setIntakeLogs([]);
  };

  // 8. Dynamic Summary Calculations
  const totals = useMemo(() => {
    const totalRecords = intakeLogs.length;
    const totalProcuredVolume = intakeLogs.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalIntakeSpend = intakeLogs.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    const avgPurchaseRate = totalProcuredVolume > 0 ? totalIntakeSpend / totalProcuredVolume : 0;
    const pendingSettlements = intakeLogs
      .reduce((sum, item) => {
        if (item.pendingAmount !== undefined) {
          return sum + (parseFloat(item.pendingAmount) || 0);
        }
        if (item.settlement === 'Paid') return sum;
        if (item.settlement === 'Partial') return sum + ((item.totalCost || 0) * 0.5);
        return sum + (item.totalCost || 0);
      }, 0);
    const morningVolume = intakeLogs
      .filter((item) => item.shift === 'Morning')
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
    const eveningVolume = intakeLogs
      .filter((item) => item.shift === 'Evening')
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    return {
      totalRecords,
      totalProcuredVolume,
      totalIntakeSpend,
      avgPurchaseRate,
      pendingSettlements,
      morningVolume,
      eveningVolume,
    };
  }, [intakeLogs]);

  const value = {
    intakeLogs,
    totals,
    addIntake,
    addBatchIntake,
    updateIntake,
    updateBatchSettlement,
    settleAllBatchesForSupplier,
    settleBatchesWithAmount,
    deleteIntake,
    resetIntakeToDefault,
  };

  return (
    <IntakeContext.Provider value={value}>
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntakeContext() {
  const context = useContext(IntakeContext);
  if (!context) {
    throw new Error('useIntakeContext must be used within an IntakeProvider');
  }
  return context;
}

export default IntakeContext;
