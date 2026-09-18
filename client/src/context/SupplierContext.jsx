import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useIntakeContext } from './IntakeContext';

const SupplierContext = createContext(null);

// Storage keys
const STORAGE_KEY = 'pure_milk_bar_suppliers_v4';
const PAYOUTS_KEY = 'pure_milk_bar_supplier_payouts_v2';

export function SupplierProvider({ children }) {
  // 1. Consume intakeLogs and batch settlement methods from IntakeContext
  let intakeLogs = [];
  let updateBatchSettlement = null;
  let settleAllBatchesForSupplier = null;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const intakeCtx = useIntakeContext();
    if (intakeCtx) {
      intakeLogs = intakeCtx.intakeLogs || [];
      updateBatchSettlement = intakeCtx.updateBatchSettlement;
      settleAllBatchesForSupplier = intakeCtx.settleAllBatchesForSupplier;
    }
  } catch (err) {
    console.warn('IntakeContext not available in SupplierProvider:', err);
  }

  // 2. Load suppliers from LocalStorage (defaults to empty [] so no dummy suppliers are shown)
  const [suppliers, setSuppliers] = useState(() => {
    try {
      localStorage.removeItem('pure_milk_bar_suppliers_v3');
      localStorage.removeItem('pure_milk_bar_suppliers_v1');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading suppliers from localStorage:', err);
    }
    return [];
  });

  // 3. Direct payouts / settlements state
  const [directPayouts, setDirectPayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(PAYOUTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading supplier payouts:', e);
    }
    return [];
  });

  // Sync suppliers to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
    } catch (err) {
      console.error('Error saving suppliers to localStorage:', err);
    }
  }, [suppliers]);

  // Sync payouts to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(PAYOUTS_KEY, JSON.stringify(directPayouts));
    } catch (err) {
      console.error('Error saving supplier payouts to localStorage:', err);
    }
  }, [directPayouts]);

  // 4. Add Supplier
  const addSupplier = (newSupplierData) => {
    const nextNum = suppliers.length + 101;
    const avg = parseFloat(newSupplierData.avgLiters) || 10;
    const createdSupplier = {
      id: `SUP-${nextNum}`,
      name: newSupplierData.name?.trim() || 'New Supplier',
      supplierType: newSupplierData.supplierType || 'Individual Farmer',
      area: newSupplierData.area?.trim() || 'Central',
      contact: newSupplierData.contact?.trim() || '',
      address: newSupplierData.address?.trim() || '',
      ratePerLiter: parseFloat(newSupplierData.ratePerLiter) || 220,
      avgLiters: avg,
      avgMorning: parseFloat(newSupplierData.avgMorning) || avg,
      avgEvening: parseFloat(newSupplierData.avgEvening) || avg,
      totalSourced: parseFloat(newSupplierData.totalSourced) || 0,
      totalPayout: parseFloat(newSupplierData.totalPayout) || 0,
      balanceDue: parseFloat(newSupplierData.balanceDue) || 0,
      initialBalanceDue: parseFloat(newSupplierData.balanceDue) || 0,
      status: newSupplierData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSuppliers((prev) => [createdSupplier, ...prev]);
    return createdSupplier;
  };

  // 5. Edit / Update Supplier
  const updateSupplier = (id, updatedFields) => {
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === id) {
          return {
            ...sup,
            ...updatedFields,
            ratePerLiter:
              updatedFields.ratePerLiter !== undefined
                ? parseFloat(updatedFields.ratePerLiter) || sup.ratePerLiter
                : sup.ratePerLiter,
            totalSourced:
              updatedFields.totalSourced !== undefined
                ? parseFloat(updatedFields.totalSourced) || sup.totalSourced
                : sup.totalSourced,
            totalPayout:
              updatedFields.totalPayout !== undefined
                ? parseFloat(updatedFields.totalPayout) || sup.totalPayout
                : sup.totalPayout,
            balanceDue:
              updatedFields.balanceDue !== undefined
                ? parseFloat(updatedFields.balanceDue) || 0
                : sup.balanceDue,
          };
        }
        return sup;
      })
    );
  };

  // 6. Delete Supplier
  const deleteSupplier = (id) => {
    setSuppliers((prev) => prev.filter((sup) => sup.id !== id));
  };

  // 7. Reset Suppliers to clean default
  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PAYOUTS_KEY);
      localStorage.removeItem('pure_milk_bar_suppliers_v3');
      localStorage.removeItem('pure_milk_bar_suppliers_v1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(PAYOUTS_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to reset suppliers in localStorage:', e);
    }
    setSuppliers([]);
    setDirectPayouts([]);
  };

  // 8. Settle Outstanding Balance for a Supplier
  const settleSupplierBalance = (supplierId) => {
    const target = suppliers.find((s) => s.id === supplierId);
    if (!target) return;

    // Settle pending intake slips
    if (settleAllBatchesForSupplier) {
      settleAllBatchesForSupplier(target.id, target.name);
    }

    // Also record a clearance payout record
    const payoutRecord = {
      id: `PAY-${Date.now()}`,
      supplierId: target.id,
      supplierName: target.name,
      amount: target.balanceDue || 0,
      date: new Date().toISOString().split('T')[0],
      method: 'Cash / Clearance',
      notes: `Balance cleared for ${target.name}`,
    };
    setDirectPayouts((prev) => [payoutRecord, ...prev]);
  };

  // 9. Record a Direct Supplier Payout
  const recordSupplierPayout = (supplierId, amount, note = '') => {
    const target = suppliers.find((s) => s.id === supplierId);
    if (!target) return;
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;

    const payoutRecord = {
      id: `PAY-${Date.now()}`,
      supplierId: target.id,
      supplierName: target.name,
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      method: 'Cash / Settlement',
      notes: note || `Disbursed payout of Rs. ${numAmount.toLocaleString()}`,
    };
    setDirectPayouts((prev) => [payoutRecord, ...prev]);
  };

  // 10. DYNAMIC ENRICHMENT: Calculate Live Sourced, Payout, and Balance Due per Supplier
  const enrichedSuppliers = useMemo(() => {
    return suppliers.map((sup) => {
      // Find all batches in intakeLogs matching this supplier
      const matchedBatches = (intakeLogs || []).filter((b) => {
        if (!b || !sup) return false;
        if (b.supplierId && sup.id && b.supplierId.trim().toLowerCase() === sup.id.trim().toLowerCase()) {
          return true;
        }
        if (b.supplierName && sup.name) {
          const bName = b.supplierName.trim().toLowerCase();
          const sName = sup.name.trim().toLowerCase();
          if (bName === sName) return true;
          // Partial name matching e.g. "Supplier A (Ahmad Farms)" matches "Ahmad Farms"
          if (bName.includes(sName) || sName.includes(bName)) return true;
        }
        return false;
      });

      const supRate = parseFloat(sup.ratePerLiter) || 220;

      // Sum of any direct manual payouts recorded for this supplier
      const manualPaid = directPayouts
        .filter((p) => p.supplierId === sup.id)
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // If no batches exist yet in intake register for this supplier
      if (matchedBatches.length === 0) {
        const totalSourced = parseFloat(sup.totalSourced) || 0;
        const initialGross = totalSourced * supRate;
        const totalPayout = (parseFloat(sup.totalPayout) || 0) + manualPaid;
        const balanceDue = Math.max(0, (parseFloat(sup.balanceDue) || 0) - manualPaid);

        return {
          ...sup,
          ratePerLiter: supRate,
          totalSourced,
          grossProcuredValue: initialGross,
          totalPayout,
          balanceDue,
          batchesCount: 0,
          pendingBatchesCount: 0,
        };
      }

      // Dynamic calculation from real intake slips
      const totalSourced = matchedBatches.reduce(
        (sum, b) => sum + (parseFloat(b.quantity) || 0),
        0
      );

      const grossProcuredValue = matchedBatches.reduce((sum, b) => {
        const qty = parseFloat(b.quantity) || 0;
        const rate = parseFloat(b.ratePerLiter) || supRate;
        return sum + (parseFloat(b.totalCost) || (qty * rate));
      }, 0);

      // Paid slips value using actual paidAmount
      const slipsPaid = matchedBatches.reduce((sum, b) => {
        const qty = parseFloat(b.quantity) || 0;
        const rate = parseFloat(b.ratePerLiter) || supRate;
        const cost = parseFloat(b.totalCost) || (qty * rate);
        if (b.paidAmount !== undefined && b.paidAmount !== '') {
          return sum + Math.min(cost, Math.max(0, parseFloat(b.paidAmount) || 0));
        }
        if (b.settlement === 'Paid') return sum + cost;
        if (b.settlement === 'Partial') return sum + (cost * 0.5);
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

  // 11. Dynamic Summary Totals
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
    totals,
    directPayouts,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    resetToDefault,
    settleSupplierBalance,
    recordSupplierPayout,
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplierContext() {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplierContext must be used within a SupplierProvider');
  }
  return context;
}

export default SupplierContext;
