import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import supplierService from '@/services/supplierService';

const IntakeContext = createContext(null);

export function IntakeProvider({ children }) {
  const [intakeLogs, setIntakeLogs] = useState([]);
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
        const paid = parseFloat(p.paidAmount || (p.paymentStatus === 'PAID' ? cost : 0));
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
          settlement: p.paymentStatus === 'PAID' ? 'Paid' : p.paymentStatus === 'PARTIAL' ? 'Partial' : 'Pending',
          fat: p.fatPercentage || p.fat || 4.5,
          snf: p.snfPercentage || p.snf || 8.5,
          lr: p.lactometerReading || p.lr || 28.0,
          shift: p.shift || 'Morning',
          chiller: p.chiller || 'Chiller-1',
          status: p.qualityGrade === 'REJECTED' ? 'Rejected' : 'Accepted',
        };
      });
      setIntakeLogs(normalized);
    } catch (err) {
      console.error('Failed to fetch procurements from API:', err);
      setError(err.message || 'Failed to load intake records');
      setIntakeLogs([]);
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
        snfPercentage: snfVal,
        lactometerReading: lrVal,
        ratePerLiter: rate,
        totalAmount: cost,
        paymentStatus: newRecord.settlement === 'Paid' ? 'PAID' : newRecord.settlement === 'Partial' ? 'PARTIAL' : 'PENDING',
        paidAmount: parseFloat(newRecord.paidAmount) || 0,
      };

      const created = await supplierService.createProcurement(payload);
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

      await fetchIntakes();
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

  // Update Batch Settlement via API
  const updateBatchSettlement = async (intakeId, newSettlement, paidAmt = null, method = 'Cash', notes = '') => {
    try {
      await supplierService.updateProcurement(intakeId, {
        paymentStatus: newSettlement.toUpperCase(),
        paidAmount: paidAmt,
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

  const totals = useMemo(() => {
    const totalVolume = intakeLogs.reduce((acc, log) => acc + (parseFloat(log.quantity) || 0), 0);
    const totalExpenditure = intakeLogs.reduce((acc, log) => acc + (parseFloat(log.totalCost) || 0), 0);
    const totalPaid = intakeLogs.reduce((acc, log) => acc + (parseFloat(log.paidAmount) || 0), 0);
    const totalPending = intakeLogs.reduce((acc, log) => acc + (parseFloat(log.pendingAmount) || 0), 0);
    const avgFat = intakeLogs.length > 0 ? (intakeLogs.reduce((acc, log) => acc + (parseFloat(log.fat) || 0), 0) / intakeLogs.length).toFixed(1) : 0;
    const avgSnf = intakeLogs.length > 0 ? (intakeLogs.reduce((acc, log) => acc + (parseFloat(log.snf) || 0), 0) / intakeLogs.length).toFixed(1) : 0;

    return {
      totalBatches: intakeLogs.length,
      totalVolume: parseFloat(totalVolume.toFixed(1)),
      totalExpenditure: Math.round(totalExpenditure),
      totalPaid: Math.round(totalPaid),
      totalPending: Math.round(totalPending),
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
