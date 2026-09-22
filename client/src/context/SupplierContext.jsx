import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useIntakeContext } from './IntakeContext';
import supplierService from '@/services/supplierService';

const SupplierContext = createContext(null);

export function SupplierProvider({ children }) {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directPayouts, setDirectPayouts] = useState([]);

  // Consume intakeLogs from IntakeContext
  let intakeLogs = [];
  let updateBatchSettlement = null;
  let settleAllBatchesForSupplier = null;
  let settleBatchesWithAmount = null;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const intakeCtx = useIntakeContext();
    if (intakeCtx) {
      intakeLogs = intakeCtx.intakeLogs || [];
      updateBatchSettlement = intakeCtx.updateBatchSettlement;
      settleAllBatchesForSupplier = intakeCtx.settleAllBatchesForSupplier;
      settleBatchesWithAmount = intakeCtx.settleBatchesWithAmount;
    }
  } catch (err) {
    console.warn('IntakeContext not available in SupplierProvider:', err);
  }

  // Fetch live suppliers from API
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supplierService.getSuppliers();
      const list = Array.isArray(data) ? data : data?.suppliers || [];
      const normalized = list.map((s) => ({
        ...s,
        id: s._id || s.id,
        _id: s._id || s.id,
        code: s.code || `SUP-${String(s._id || s.id).slice(-4)}`,
        name: s.name || 'Supplier',
        phone: s.phone || s.contact || '',
        contact: s.phone || s.contact || '',
        area: s.villageOrLocation || s.area || 'Central',
        ratePerLiter: Number(s.baseRatePerLiter || s.baseRate || s.ratePerLiter) || 220,
        baseRate: Number(s.baseRatePerLiter || s.baseRate || s.ratePerLiter) || 220,
        avgLiters: Number(s.expectedDailyQuantity || s.avgLiters) || 10,
        status: s.status || 'Active',
      }));
      setSuppliers(normalized);
    } catch (err) {
      console.error('Failed to fetch suppliers from API:', err);
      setError(err.message || 'Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Add Supplier via API
  const addSupplier = async (newSupplierData) => {
    try {
      const payload = {
        code: newSupplierData.code || `SUP-${Date.now().toString().slice(-4)}`,
        name: newSupplierData.name?.trim() || 'New Supplier',
        supplierType: newSupplierData.supplierType || 'Individual Farmer',
        villageOrLocation: newSupplierData.area?.trim() || newSupplierData.address?.trim() || 'Central Location',
        area: newSupplierData.area?.trim() || 'Central',
        phone: newSupplierData.contact?.trim() || newSupplierData.phone || '03001234567',
        address: newSupplierData.address?.trim() || '',
        milkType: (newSupplierData.milkType || 'BUFFALO').toUpperCase(),
        baseRatePerLiter: parseFloat(newSupplierData.ratePerLiter || newSupplierData.baseRate) || 220,
        baseRate: parseFloat(newSupplierData.ratePerLiter || newSupplierData.baseRate) || 220,
        expectedDailyQuantity: parseFloat(newSupplierData.avgLiters) || 10,
        status: newSupplierData.status || 'Active',
      };

      const created = await supplierService.createSupplier(payload);
      const normalized = {
        ...created,
        id: created._id || created.id || `SUP-${Date.now()}`,
        contact: created.phone || newSupplierData.contact,
        ratePerLiter: created.baseRatePerLiter || created.baseRate || newSupplierData.ratePerLiter || 220,
        avgLiters: created.expectedDailyQuantity || newSupplierData.avgLiters || 10,
      };

      setSuppliers((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('Failed to create supplier via API:', err);
      throw err;
    }
  };

  // Update Supplier via API
  const updateSupplier = async (id, updatedData) => {
    try {
      await supplierService.updateSupplier(id, updatedData);
      setSuppliers((prev) =>
        prev.map((s) => ((s._id || s.id) === id ? { ...s, ...updatedData } : s))
      );
    } catch (err) {
      console.error('Failed to update supplier via API:', err);
      throw err;
    }
  };

  // Delete Supplier via API
  const deleteSupplier = async (id) => {
    try {
      await supplierService.deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (err) {
      console.error('Failed to delete supplier via API:', err);
      throw err;
    }
  };

  const recordSupplierPayout = (payoutData) => {
    const payoutRecord = {
      id: `PAY-${Date.now()}`,
      supplierId: payoutData.supplierId,
      amount: parseFloat(payoutData.amount) || 0,
      method: payoutData.method || 'Cash',
      notes: payoutData.notes || '',
      date: payoutData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setDirectPayouts((prev) => [payoutRecord, ...prev]);
    return payoutRecord;
  };

  const settleSupplierBalance = (supplierId, amount = null, paymentMethod = 'Cash', notes = '') => {
    const targetSup = suppliers.find((s) => (s._id || s.id) === supplierId);
    if (!targetSup) return false;

    if (amount === null || amount === undefined) {
      if (settleAllBatchesForSupplier) {
        settleAllBatchesForSupplier(supplierId, paymentMethod, notes);
      }
    } else {
      if (settleBatchesWithAmount) {
        settleBatchesWithAmount(supplierId, amount, paymentMethod, notes);
      }
    }
    return true;
  };

  const resetToDefault = () => {
    fetchSuppliers();
  };

  // Enriched live suppliers with dynamic intake reconciliations
  const enrichedSuppliers = useMemo(() => {
    return suppliers.map((sup) => {
      const supId = sup._id || sup.id;
      const supName = (sup.name || '').trim().toLowerCase();
      const supRate = parseFloat(sup.ratePerLiter || sup.baseRate) || 220;

      const matchedBatches = (intakeLogs || []).filter((batch) => {
        const bSupId = batch.supplierId;
        const bSupName = (batch.supplierName || '').trim().toLowerCase();
        return (
          (bSupId && String(bSupId) === String(supId)) ||
          (bSupName && supName && bSupName === supName)
        );
      });

      const manualPaid = (directPayouts || [])
        .filter((p) => String(p.supplierId) === String(supId))
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      if (matchedBatches.length === 0) {
        const totalSourced = parseFloat(sup.totalSourced) || 0;
        const totalPayout = parseFloat(sup.totalPayout || 0) + manualPaid;
        const initialGross = Math.round(totalSourced * supRate);
        const balanceDue = Math.max(0, (parseFloat(sup.balanceDue) || 0) - manualPaid);

        return {
          ...sup,
          id: supId,
          ratePerLiter: supRate,
          totalSourced,
          grossProcuredValue: initialGross,
          totalPayout,
          balanceDue,
          batchesCount: 0,
          pendingBatchesCount: 0,
        };
      }

      const totalSourced = matchedBatches.reduce(
        (sum, b) => sum + (parseFloat(b.quantity || b.quantityLiters) || 0),
        0
      );

      const grossProcuredValue = matchedBatches.reduce((sum, b) => {
        const qty = parseFloat(b.quantity || b.quantityLiters) || 0;
        const rate = parseFloat(b.ratePerLiter) || supRate;
        return sum + (parseFloat(b.totalCost || b.totalAmount) || qty * rate);
      }, 0);

      const slipsPaid = matchedBatches.reduce((sum, b) => {
        const qty = parseFloat(b.quantity || b.quantityLiters) || 0;
        const rate = parseFloat(b.ratePerLiter) || supRate;
        const cost = parseFloat(b.totalCost || b.totalAmount) || qty * rate;
        if (b.paidAmount !== undefined && b.paidAmount !== '') {
          return sum + Math.min(cost, Math.max(0, parseFloat(b.paidAmount) || 0));
        }
        if (b.settlement === 'Paid') return sum + cost;
        if (b.settlement === 'Partial') return sum + cost * 0.5;
        return sum;
      }, 0);

      const pendingBatches = matchedBatches.filter((b) => {
        if (b.pendingAmount !== undefined) return parseFloat(b.pendingAmount) > 0;
        return b.settlement !== 'Paid';
      });

      const initialDue = parseFloat(sup.initialBalanceDue || 0);
      const totalPayout = Math.round(slipsPaid + manualPaid);
      const balanceDue = Math.max(0, Math.round(initialDue + grossProcuredValue - totalPayout));

      return {
        ...sup,
        id: supId,
        ratePerLiter: supRate,
        totalSourced: parseFloat(totalSourced.toFixed(1)),
        grossProcuredValue: Math.round(grossProcuredValue),
        totalPayout,
        balanceDue,
        batchesCount: matchedBatches.length,
        pendingBatchesCount: pendingBatches.length,
      };
    });
  }, [suppliers, intakeLogs, directPayouts]);

  const totals = useMemo(() => {
    const totalSuppliers = enrichedSuppliers.length;
    const activeSuppliers = enrichedSuppliers.filter((s) => s.status === 'Active').length;
    const inactiveSuppliers = enrichedSuppliers.filter((s) => s.status === 'Inactive').length;
    const totalSourcedLiters = enrichedSuppliers.reduce((sum, s) => sum + (s.totalSourced || 0), 0);
    const totalPayouts = enrichedSuppliers.reduce((sum, s) => sum + (s.totalPayout || 0), 0);
    const outstandingBalances = enrichedSuppliers.reduce((sum, s) => sum + (s.balanceDue || 0), 0);

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalVendors: totalSuppliers,
      activeVendors: activeSuppliers,
      inactiveVendors: inactiveSuppliers,
      totalSourcedLiters: parseFloat(totalSourcedLiters.toFixed(1)),
      totalPayouts: Math.round(totalPayouts),
      outstandingBalances: Math.round(outstandingBalances),
    };
  }, [enrichedSuppliers]);

  const value = {
    suppliers: enrichedSuppliers,
    rawSuppliers: suppliers,
    isLoading,
    error,
    refreshSuppliers: fetchSuppliers,
    totals,
    directPayouts,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    resetToDefault,
    settleSupplierBalance,
    recordSupplierPayout,
  };

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
}

export function useSupplierContext() {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplierContext must be used within a SupplierProvider');
  }
  return context;
}

export default SupplierContext;
