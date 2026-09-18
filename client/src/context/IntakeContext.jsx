import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const IntakeContext = createContext(null);

const STORAGE_KEY = 'pure_milk_bar_intake_records_v3';

// 7 Default Intake Slips matching reference screenshot "Intake History (7)"
const DEFAULT_INTAKE_RECORDS = [
  {
    id: 'INT-901',
    date: '2026-09-17',
    time: '06:30 AM',
    supplierId: 'SUP-A',
    supplierName: 'Supplier A (Ahmad Farms)',
    area: 'Sahiwal',
    shift: 'Morning',
    quantity: 45.0,
    ratePerLiter: 230,
    totalCost: 10350,
    paidAmount: 10350,
    pendingAmount: 0,
    fat: 6.8,
    lr: 29.5,
    snf: 9.07,
    settlement: 'Paid',
    receivedBy: 'Farhan (Lab Incharge)',
    notes: 'Pure buffalo milk, excellent density',
  },
  {
    id: 'INT-902',
    date: '2026-09-17',
    time: '06:45 AM',
    supplierId: 'SUP-B',
    supplierName: 'Supplier B (Chaudhry Dairy)',
    area: 'Gujranwala',
    shift: 'Morning',
    quantity: 65.0,
    ratePerLiter: 225,
    totalCost: 14625,
    paidAmount: 0,
    pendingAmount: 14625,
    fat: 4.2,
    lr: 28.5,
    snf: 8.52,
    settlement: 'Pending',
    receivedBy: 'Farhan (Lab Incharge)',
    notes: 'Cow milk batch, tested pure',
  },
  {
    id: 'INT-903',
    date: '2026-09-17',
    time: '07:10 AM',
    supplierId: 'SUP-C',
    supplierName: 'Supplier C (Bismillah Agro)',
    area: 'Faisalabad',
    shift: 'Morning',
    quantity: 50.0,
    ratePerLiter: 228,
    totalCost: 11400,
    paidAmount: 11400,
    pendingAmount: 0,
    fat: 5.1,
    lr: 29.0,
    snf: 8.87,
    settlement: 'Paid',
    receivedBy: 'Tariq (Supervisor)',
    notes: 'Chilled delivery in insulated van',
  },
  {
    id: 'INT-904',
    date: '2026-09-16',
    time: '05:30 PM',
    supplierId: 'SUP-A',
    supplierName: 'Supplier A (Ahmad Farms)',
    area: 'Sahiwal',
    shift: 'Evening',
    quantity: 40.0,
    ratePerLiter: 230,
    totalCost: 9200,
    paidAmount: 9200,
    pendingAmount: 0,
    fat: 6.7,
    lr: 29.2,
    snf: 8.97,
    settlement: 'Paid',
    receivedBy: 'Bilal (Shift Tech)',
    notes: 'Evening session collection',
  },
  {
    id: 'INT-905',
    date: '2026-09-16',
    time: '06:00 PM',
    supplierId: 'SUP-B',
    supplierName: 'Supplier B (Chaudhry Dairy)',
    area: 'Gujranwala',
    shift: 'Evening',
    quantity: 55.0,
    ratePerLiter: 225,
    totalCost: 12375,
    paidAmount: 0,
    pendingAmount: 12375,
    fat: 4.3,
    lr: 28.8,
    snf: 8.62,
    settlement: 'Pending',
    receivedBy: 'Bilal (Shift Tech)',
    notes: 'Gate inspection cleared',
  },
  {
    id: 'INT-906',
    date: '2026-09-15',
    time: '06:15 AM',
    supplierId: 'SUP-C',
    supplierName: 'Supplier C (Bismillah Agro)',
    area: 'Faisalabad',
    shift: 'Morning',
    quantity: 48.0,
    ratePerLiter: 228,
    totalCost: 10944,
    paidAmount: 10944,
    pendingAmount: 0,
    fat: 5.0,
    lr: 29.1,
    snf: 8.88,
    settlement: 'Paid',
    receivedBy: 'Tariq (Supervisor)',
    notes: 'Direct morning supply',
  },
  {
    id: 'INT-907',
    date: '2026-09-15',
    time: '05:45 PM',
    supplierId: 'SUP-A',
    supplierName: 'Supplier A (Ahmad Farms)',
    area: 'Sahiwal',
    shift: 'Evening',
    quantity: 42.0,
    ratePerLiter: 230,
    totalCost: 9660,
    paidAmount: 4830,
    pendingAmount: 4830,
    fat: 6.6,
    lr: 29.0,
    snf: 8.90,
    settlement: 'Partial',
    receivedBy: 'Farhan (Lab Incharge)',
    notes: 'Quality inspection verified',
  },
];

export function IntakeProvider({ children }) {
  // Load from LocalStorage or fall back to DEFAULT_INTAKE_RECORDS
  const [intakeLogs, setIntakeLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading intake logs from localStorage:', err);
    }
    return DEFAULT_INTAKE_RECORDS;
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
    const nextId = `INT-${900 + intakeLogs.length + 1}`;
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

    let counter = intakeLogs.length + 1;
    const formattedBatch = batchRecords.map((rec) => {
      const nextId = `INT-${900 + counter++}`;
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
    setIntakeLogs(DEFAULT_INTAKE_RECORDS);
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
