import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import supplierService from '../services/supplierService';

const IntakeContext = createContext(null);

export function IntakeProvider({ children }) {
  const [intakeLogs, setIntakeLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('intake_logs_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live procurements from API
  const fetchIntakes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supplierService.getProcurements();
      const list = Array.isArray(data) ? data : data?.procurements || [];
      const normalized = list.map((p) => {
        const qty = parseFloat(p.quantityLiters || p.quantity || 0);
        const rate = parseFloat(p.ratePerLiter || 220);
        const cost = parseFloat(p.totalAmount || p.totalCost || qty * rate);
        const paid = parseFloat(p.amountPaid ?? p.paidAmount ?? 0);
        const pending = Math.max(0, cost - paid);

        return {
          ...p,
          id: p._id || p.id || `INT-${Date.now()}`,
          date: p.date ? new Date(p.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: p.time || p.shift || 'Morning',
          supplierId: p.supplierId?._id || p.supplierId || '',
          supplierName: p.supplierId?.name || p.supplierName || 'Supplier',
          quantity: qty,
          ratePerLiter: rate,
          totalCost: cost,
          paidAmount: paid,
          pendingAmount: pending,
          settlement: paid >= cost ? 'Paid' : paid > 0 ? 'Partial' : 'Pending',
          fat: p.fatPercentage || p.fat || 4.5,
          snf: p.snfCalculated || p.snf || 8.5,
          lr: p.lactometerReading || p.lr || 28.0,
          shift: p.shift || 'Morning',
          chiller: p.chiller || 'Chiller-1',
          status: p.qualityGrade === 'REJECTED' ? 'Rejected' : 'Accepted',
        };
      });
      if (normalized.length > 0) {
        setIntakeLogs(normalized);
        localStorage.setItem('intake_logs_cache', JSON.stringify(normalized));
      }
    } catch (err) {
      console.error('Failed to fetch procurements from API:', err);
      setError(err.message || 'Failed to load intake records');
      // DO NOT clear state here, rely on localStorage cache
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntakes();
  }, [fetchIntakes]);

  // Add Single Intake Record via API
  const addIntake = async (newRecord) => {
    try {
      const qty = parseFloat(newRecord.quantity) || 0;
      const rate = parseFloat(newRecord.ratePerLiter) || 220;
      const cost = parseFloat((qty * rate).toFixed(2));
      const fatVal = parseFloat(newRecord.fat) || 4.5;
      const lrVal = parseFloat(newRecord.lr) || 28.0;
      const snfVal = parseFloat(((lrVal / 4) + 0.25 * fatVal + 0.35).toFixed(2));

      const payload = {
        supplierId: newRecord.supplierId,
        date: newRecord.date || new Date().toISOString().split('T')[0],
        shift: (newRecord.shift || 'Morning').toUpperCase(),
        milkType: (newRecord.milkType || 'COW').toUpperCase(),
        quantityLiters: qty,
        fatPercentage: fatVal,
        snfCalculated: snfVal,
        lactometerReading: lrVal,
        ratePerLiter: rate,
        totalAmount: cost,
        amountPaid: parseFloat(newRecord.paidAmount) || 0,
        batchNumber: 'B-' + Date.now(),
        dockInspectorId: "64f8a1239c1b4e001c8a4567",
        balanceAddedToKhata: cost - (parseFloat(newRecord.paidAmount) || 0),
      };

      let created;
      try {
        created = await supplierService.createProcurement(payload);
      } catch (err) {
        created = { ...payload, id: `local-${Date.now()}` };
        console.warn('Procurement API unavailable, saving locally:', err.message);
      }

      const normalized = {
        ...created,
        id: created._id || created.id || `INT-${Date.now()}`,
        date: payload.date,
        time: newRecord.time || '10:00 AM',
        supplierId: newRecord.supplierId,
        supplierName: newRecord.supplierName || 'Supplier',
        quantity: qty,
        ratePerLiter: rate,
        totalCost: cost,
        paidAmount: payload.paidAmount,
        pendingAmount: Math.max(0, cost - payload.paidAmount),
        settlement: newRecord.settlement || 'Pending',
        fat: fatVal,
        snf: snfVal,
        lr: lrVal,
        shift: newRecord.shift || 'Morning',
        chiller: newRecord.chiller || 'Chiller-1',
        status: 'Accepted',
      };

      setIntakeLogs((prev) => {
        const updated = [normalized, ...prev];
        localStorage.setItem('intake_logs_cache', JSON.stringify(updated));
        return updated;
      });

      return normalized;
    } catch (err) {
      console.error('Failed to create procurement via API:', err);
      throw err;
    }
  };

  // Add Bulk Intakes
  const addBulkIntakes = async (recordsArray) => {
    try {
      const promises = recordsArray.map((r) => addIntake(r));
      await Promise.allSettled(promises);
      fetchIntakes();
    } catch (err) {
      console.error('Failed to create bulk intakes:', err);
    }
  };

  const updateBatchSettlement = async (intakeId, newSettlement, paidAmt = null, method = 'Cash', notes = '') => {
    try {
      const intake = intakeLogs.find((l) => l.id === intakeId || l._id === intakeId);
      const cost = intake ? parseFloat(intake.totalCost) : 0;
      const actualPaid = paidAmt !== null ? parseFloat(paidAmt) : (newSettlement === 'Paid' ? cost : (newSettlement === 'Partial' ? cost * 0.5 : 0));

      await supplierService.updateProcurement(intakeId, {
        amountPaid: actualPaid,
      });

      setIntakeLogs((prev) =>
        prev.map((log) => {
          if (log.id === intakeId || log._id === intakeId) {
            const cost = parseFloat(log.totalCost) || 0;
            const paid = paidAmt !== null ? parseFloat(paidAmt) : newSettlement === 'Paid' ? cost : cost * 0.5;
            return {
              ...log,
              settlement: newSettlement,
              paidAmount: paid,
              pendingAmount: Math.max(0, cost - paid),
            };
          }
          return log;
        })
      );
    } catch (err) {
      console.error('Failed to update procurement settlement:', err);
    }
  };

  const updateIntake = async (id, payload) => {
    try {
      await supplierService.updateProcurement(id, {
        amountPaid: parseFloat(payload.paidAmount ?? payload.amountPaid) || 0,
      });
      setIntakeLogs((prev) => prev.map((log) => {
        if (log.id !== id && log._id !== id) return log;
        const cost = parseFloat(log.totalCost) || 0;
        const paid = Math.min(cost, Math.max(0, parseFloat(payload.paidAmount ?? payload.amountPaid) || 0));
        return {
          ...log,
          paidAmount: paid,
          pendingAmount: Math.max(0, cost - paid),
          settlement: paid >= cost ? 'Paid' : paid > 0 ? 'Partial' : 'Pending',
        };
      }));
    } catch (err) {
      console.error('Failed to update intake:', err);
    }
  };

  const settleBatchesWithAmount = async (supplierId, amount, method = 'Cash', notes = '') => {
    let remaining = Math.max(0, parseFloat(amount) || 0);
    const pendingBatches = intakeLogs
      .filter((log) => String(log.supplierId) === String(supplierId) && (parseFloat(log.pendingAmount) || 0) > 0)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    for (const batch of pendingBatches) {
      if (remaining <= 0) break;
      const due = parseFloat(batch.pendingAmount) || 0;
      const payment = Math.min(due, remaining);
      await updateBatchSettlement(batch.id, payment >= due ? 'Paid' : 'Partial', (parseFloat(batch.paidAmount) || 0) + payment, method, notes);
      remaining = Math.max(0, remaining - payment);
    }
  };

  const settleAllBatchesForSupplier = async (supplierId, method = 'Cash', notes = '') => {
    const totalDue = intakeLogs
      .filter((log) => String(log.supplierId) === String(supplierId))
      .reduce((sum, log) => sum + (parseFloat(log.pendingAmount) || 0), 0);
    await settleBatchesWithAmount(supplierId, totalDue, method, notes);
  };

  const totals = useMemo(() => {
    let morningVolume = 0;
    let eveningVolume = 0;

    const totalVolume = intakeLogs.reduce((acc, log) => {
      const vol = parseFloat(log.quantity) || 0;
      if (log.shift === 'Morning' || log.shift === 'morning' || log.time === 'Morning') {
        morningVolume += vol;
      } else {
        eveningVolume += vol;
      }
      return acc + vol;
    }, 0);

    const totalExpenditure = intakeLogs.reduce((acc, log) => acc + (parseFloat(log.totalCost) || 0), 0);
    const totalPaid = intakeLogs.reduce((acc, log) => acc + (parseFloat(log.paidAmount) || 0), 0);
    const totalPending = intakeLogs.reduce((acc, log) => acc + (parseFloat(log.pendingAmount) || 0), 0);
    const avgFat = intakeLogs.length > 0 ? (intakeLogs.reduce((acc, log) => acc + (parseFloat(log.fat) || 0), 0) / intakeLogs.length).toFixed(1) : 0;
    const avgSnf = intakeLogs.length > 0 ? (intakeLogs.reduce((acc, log) => acc + (parseFloat(log.snf) || 0), 0) / intakeLogs.length).toFixed(1) : 0;
    const avgPurchaseRate = totalVolume > 0 ? (totalExpenditure / totalVolume) : 0;

    return {
      totalBatches: intakeLogs.length,
      totalRecords: intakeLogs.length,
      totalVolume: parseFloat(totalVolume.toFixed(1)),
      totalProcuredVolume: parseFloat(totalVolume.toFixed(1)),
      morningVolume: parseFloat(morningVolume.toFixed(1)),
      eveningVolume: parseFloat(eveningVolume.toFixed(1)),
      totalExpenditure: Math.round(totalExpenditure),
      totalIntakeSpend: Math.round(totalExpenditure),
      totalPaid: Math.round(totalPaid),
      totalPending: Math.round(totalPending),
      pendingSettlements: Math.round(totalPending),
      avgPurchaseRate: parseFloat(avgPurchaseRate.toFixed(2)),
      avgFat,
      avgSnf,
    };
  }, [intakeLogs]);

  const value = {
    intakeLogs,
    isLoading,
    error,
    refreshIntakes: fetchIntakes,
    totals,
    addIntake,
    addBulkIntakes,
    updateBatchSettlement,
    settleBatchesWithAmount,
    settleAllBatchesForSupplier,
    updateIntake,
  };

  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
}

export function useIntakeContext() {
  const context = useContext(IntakeContext);
  if (!context) {
    throw new Error('useIntakeContext must be used within an IntakeProvider');
  }
  return context;
}

export default IntakeContext;
