import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAnimalContext } from './AnimalContext';
import { useIntakeContext } from './IntakeContext';
import { usePOSContext } from './POSContext';

const DahiContext = createContext(null);

const STORAGE_KEY_DAHI = 'pure_milk_bar_dahi_batches_v5';

// Helper to filter out any mock/legacy dummy batches
const isLegacyDummyBatch = (b) => {
  if (!b) return true;
  const id = String(b.id || '').toUpperCase();
  return id.startsWith('BATCH-20260824') || id.includes('MOCK') || id.includes('DEMO');
};

export function DahiProvider({ children }) {
  // Live herd animals and milking logs from AnimalContext (Real data from API / database)
  const animalCtx = useAnimalContext();
  const animals = animalCtx?.animals || [];
  const milkingLogs = animalCtx?.milkingLogs || [];

  // Live supplier procurements from IntakeContext (Real data from API / database)
  const intakeCtx = useIntakeContext();
  const intakeLogs = intakeCtx?.intakeLogs || [];

  // POS products and inventory from POSContext
  const posCtx = usePOSContext();
  const products = posCtx?.products || [];

  // Version counter to trigger re-renders on local storage events
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => setSyncVersion((v) => v + 1);
    window.addEventListener('pure_milk_bar_milking_updated', handleSync);
    window.addEventListener('pure_milk_bar_sales_updated', handleSync);
    window.addEventListener('pure_milk_bar_dahi_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('pure_milk_bar_milking_updated', handleSync);
      window.removeEventListener('pure_milk_bar_sales_updated', handleSync);
      window.removeEventListener('pure_milk_bar_dahi_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Batches state persisted in LocalStorage - STRICTLY REAL DATA (No dummy batches)
  const [batches, setBatches] = useState(() => {
    try {
      // Clear older version mock storage keys if any
      localStorage.removeItem('pure_milk_bar_dahi_batches_v1');
      localStorage.removeItem('pure_milk_bar_dahi_batches_v2');
      localStorage.removeItem('pure_milk_bar_dahi_batches_v3');
      localStorage.removeItem('pure_milk_bar_dahi_batches_v4');

      const saved = localStorage.getItem(STORAGE_KEY_DAHI);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleanBatches = parsed.filter((b) => !isLegacyDummyBatch(b));
          localStorage.setItem(STORAGE_KEY_DAHI, JSON.stringify(cleanBatches));
          return cleanBatches;
        }
      }
    } catch (e) {
      console.error('Error loading Dahi batches from localStorage:', e);
    }
    return []; // Starts with 0 batches by default
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DAHI, JSON.stringify(batches));
      window.dispatchEvent(new Event('pure_milk_bar_dahi_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error saving Dahi batches to localStorage:', e);
    }
  }, [batches]);

  // =========================================================================
  // 1. LIVE SOURCING NUMBERS (Milking Register + Logs + Baseline & Supplier Intakes)
  // =========================================================================
  // Real farm yield from Milking Register, logs, or active herd baseline
  const realFarmYield = useMemo(() => {
    let registerSum = 0;
    try {
      const savedRaw = localStorage.getItem('pure_milk_bar_milking_saved_entries');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed) {
          ['Morning', 'Evening'].forEach((shift) => {
            if (parsed[shift] && typeof parsed[shift] === 'object') {
              Object.values(parsed[shift]).forEach((val) => {
                const num = parseFloat(val);
                if (!isNaN(num) && num > 0) registerSum += num;
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('Error reading milking register in DahiContext:', e);
    }

    let logSum = 0;
    if (Array.isArray(milkingLogs) && milkingLogs.length > 0) {
      logSum = milkingLogs.reduce((acc, log) => acc + (parseFloat(log.yieldLiters || log.yield) || 0), 0);
    }

    let baselineSum = 0;
    if (Array.isArray(animals) && animals.length > 0) {
      baselineSum = animals.reduce((acc, a) => {
        const totalDaily = parseFloat(a.totalDailyYield || 0);
        if (totalDaily > 0) return acc + totalDaily;
        const morning = parseFloat(a.morningYield || 0);
        const evening = parseFloat(a.eveningYield || 0);
        return acc + (morning + evening);
      }, 0);
    }

    const resolved = registerSum > 0 ? registerSum : (logSum > 0 ? logSum : baselineSum);
    return Number(resolved.toFixed(1));
  }, [animals, milkingLogs, syncVersion]);

  // Real supplier procurement intake
  const realSupplierIntake = useMemo(() => {
    const sum = intakeLogs.reduce((acc, item) => {
      return acc + (Number(item.quantity || item.quantityLiters) || 0);
    }, 0);

    return Number(sum.toFixed(1));
  }, [intakeLogs]);

  // =========================================================================
  // 2. CONVERSION TO DAHI (Deducted live from Farm & Supplier Milk)
  // =========================================================================
  const farmMilkSold = Number(posCtx?.farmSalesMetrics?.milkSold) || 0;
  const supplierMilkSold = Number(posCtx?.supplierSalesMetrics?.milkSold) || 0;

  const conversionData = useMemo(() => {
    let farmConverted = 0;
    let supplierConverted = 0;
    let totalOutputProduced = 0;

    batches.forEach((b) => {
      const numUsed = Number(b.milkUsedVal) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
      const numOutput = Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
      totalOutputProduced += numOutput;

      if (b.farmMilkUsed !== undefined && b.supplierMilkUsed !== undefined) {
        farmConverted += Number(b.farmMilkUsed) || 0;
        supplierConverted += Number(b.supplierMilkUsed) || 0;
      } else {
        const src = (b.source || '').toLowerCase();
        if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix')) {
          farmConverted += numUsed;
        } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix')) {
          supplierConverted += numUsed;
        } else {
          // Proportionally split based on available sourcing
          const totalSourced = realFarmYield + realSupplierIntake;
          const ratio = totalSourced > 0 ? realFarmYield / totalSourced : 0.5;
          const fPortion = Math.round(numUsed * ratio);
          farmConverted += fPortion;
          supplierConverted += Math.max(0, numUsed - fPortion);
        }
      }
    });

    const totalConverted = farmConverted + supplierConverted;

    // Remaining liquid milk after BOTH POS sales AND Dahi conversion:
    const remainingFarm = Math.max(0, Number((realFarmYield - farmMilkSold - farmConverted).toFixed(1)));
    const remainingSupplier = Math.max(0, Number((realSupplierIntake - supplierMilkSold - supplierConverted).toFixed(1)));
    const remainingTotal = Number((remainingFarm + remainingSupplier).toFixed(1));

    // Conversion yield %
    const yieldPct = totalConverted > 0
      ? ((totalOutputProduced / totalConverted) * 100).toFixed(1)
      : '0.0';

    // Real Value-Add Net Profit: (Retail POS rate - Raw milk cost approx 220) * output
    const netProfitValue = batches.reduce((acc, b) => {
      const out = Number(b.outputVal) || 0;
      const rate = parseFloat(String(b.posRate || '').replace(/[^\d.]/g, '')) || 320;
      const profitPerKg = Math.max(0, rate - 220);
      return acc + Math.round(out * profitPerKg);
    }, 0);

    return {
      farmConverted: Math.round(farmConverted),
      supplierConverted: Math.round(supplierConverted),
      totalConverted: Number(totalConverted.toFixed(1)),
      totalOutputProduced: Number(totalOutputProduced.toFixed(1)),
      yieldPct,
      remainingFarm,
      remainingSupplier,
      remainingTotal,
      netProfitValue,
    };
  }, [batches, realFarmYield, realSupplierIntake, farmMilkSold, supplierMilkSold, syncVersion]);

  // Read live POS sales history for Dahi sales & extra profit tracking
  const salesHistory = posCtx?.salesHistory || [];

  const dahiSalesData = useMemo(() => {
    let soldKg = 0;
    let revenue = 0;
    let salesCount = 0;

    salesHistory.forEach((sale) => {
      let saleHasDahi = false;
      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        if (name.includes('dahi') || cat.includes('dahi')) {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const sub = Number(item.subtotal) || (qty * price);
          soldKg += qty;
          revenue += sub;
          saleHasDahi = true;
        }
      });
      if (saleHasDahi) salesCount++;
    });

    // Real Extra Profit from Dahi Sales (Value-Add over liquid milk):
    // Average Liquid milk price = Rs. 260 / kg. Average Dahi price = Rs. 320 / kg.
    // Extra margin = Rs. 60 / kg.
    const extraProfitMargin = 60;
    const extraProfitFromSales = Math.round(soldKg * extraProfitMargin);

    return {
      soldKg: Number(soldKg.toFixed(1)),
      revenue: Math.round(revenue),
      salesCount,
      extraProfitFromSales,
    };
  }, [salesHistory]);

  const dahiTransferredToPOS = useMemo(() => {
    return batches
      .filter((b) => b.stage === 'pos')
      .reduce((sum, b) => sum + (Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0), 0);
  }, [batches]);

  const liveDahiPOSStock = Math.max(0, Number((dahiTransferredToPOS - dahiSalesData.soldKg).toFixed(1)));

  // Unified metrics for top KPI cards & widgets (Pure Real Data + Live POS Sales)
  const metrics = useMemo(() => {
    const totalSourced = Number((realFarmYield + realSupplierIntake).toFixed(1));
    const potentialExtraProfit = Math.round(conversionData.totalOutputProduced * 60);

    return {
      totalMilkSourced: String(totalSourced),
      farmSourced: String(Math.round(realFarmYield)),
      supplierSourced: String(Math.round(realSupplierIntake)),
      convertedToDahi: String(conversionData.totalConverted),
      farmConverted: String(conversionData.farmConverted),
      supplierConverted: String(conversionData.supplierConverted),
      dahiProduced: String(conversionData.totalOutputProduced),
      conversionYield: String(conversionData.yieldPct),
      valueAddProfit: potentialExtraProfit.toLocaleString(),
      // Sales metrics from live POS
      dahiSoldInPOS: String(dahiSalesData.soldKg),
      dahiSalesRevenue: dahiSalesData.revenue.toLocaleString(),
      dahiSalesOrdersCount: dahiSalesData.salesCount,
      dahiRealizedExtraProfit: dahiSalesData.extraProfitFromSales.toLocaleString(),
      dahiPOSStock: String(liveDahiPOSStock),
      dahiTransferredToPOS: String(dahiTransferredToPOS),
      // Remaining liquid milk after dahi conversion
      remainingFarmMilk: conversionData.remainingFarm,
      remainingSupplierMilk: conversionData.remainingSupplier,
      remainingTotalMilk: conversionData.remainingTotal,
    };
  }, [realFarmYield, realSupplierIntake, conversionData, dahiSalesData, dahiTransferredToPOS, liveDahiPOSStock]);

  // =========================================================================
  // 3. PIPELINE ACTIONS
  // =========================================================================
  // Add new batch (deducts from milk and adds to kitchen pipeline)
  const addBatch = useCallback((formData) => {
    const rawMilkNum = parseFloat(formData.milkUsed) || 0;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = batches.length + 1;
    const batchId = `BATCH-${today}-${String(count).padStart(2, '0')}`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let farmPortion = 0;
    let supPortion = 0;

    if (formData.source === 'Farm Milk') {
      farmPortion = rawMilkNum;
      supPortion = 0;
    } else if (formData.source === 'Supplier Milk') {
      farmPortion = 0;
      supPortion = rawMilkNum;
    } else {
      if (formData.farmMilkUsed !== undefined && formData.supplierMilkUsed !== undefined) {
        farmPortion = parseFloat(formData.farmMilkUsed) || 0;
        supPortion = parseFloat(formData.supplierMilkUsed) || 0;
      } else {
        const totalAvail = realFarmYield + realSupplierIntake;
        const ratio = totalAvail > 0 ? realFarmYield / totalAvail : 0.5;
        farmPortion = Math.round(rawMilkNum * ratio);
        supPortion = Math.max(0, rawMilkNum - farmPortion);
      }
    }

    const calculatedOutput = formData.output
      ? String(formData.output).endsWith('kg') ? String(formData.output) : `${formData.output} kg`
      : `${(rawMilkNum * 0.985).toFixed(1)} kg`;
    const numOutput = parseFloat(calculatedOutput) || Number((rawMilkNum * 0.985).toFixed(1));

    const rateNum = parseFloat(String(formData.posRate || '').replace(/[^\d.]/g, '')) || 320;
    const profitPerKg = Math.max(0, rateNum - 220);
    const expectedProfitVal = Math.round(numOutput * profitPerKg);

    const newRecord = {
      id: batchId,
      time: timeNow,
      date: formData.date || new Date().toISOString().split('T')[0],
      product: formData.product || 'Fresh Dahi (Yogurt)',
      source: formData.source || 'Farm & Supplier Mix',
      milkUsed: `${rawMilkNum} kg (${formData.source === 'Farm Milk' ? 'Farm' : formData.source === 'Supplier Milk' ? 'Supplier' : 'Mixed'})`,
      milkUsedVal: rawMilkNum,
      farmMilkUsed: farmPortion,
      supplierMilkUsed: supPortion,
      output: calculatedOutput,
      outputVal: numOutput,
      fat: formData.fat ? (String(formData.fat).includes('%') ? formData.fat : `${formData.fat}%`) : '4.5%',
      stage: 'incubating',
      status: 'In Progress',
      posRate: formData.posRate ? (String(formData.posRate).includes('Rs.') ? formData.posRate : `Rs. ${formData.posRate} / kg`) : `Rs. ${rateNum} / kg`,
      expectedProfit: `+Rs. ${expectedProfitVal.toLocaleString()}`,
    };

    setBatches((prev) => [newRecord, ...prev]);
    return newRecord;
  }, [batches.length, realFarmYield, realSupplierIntake]);

  // Stage transition 1 -> 2: Move from Incubating to Chilled Storage
  const moveToChiller = useCallback((batchId) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const rateNum = parseFloat(String(b.posRate || '').replace(/[^\d.]/g, '')) || 320;
        const profit = Math.round((b.outputVal || 0) * Math.max(0, rateNum - 220));
        return {
          ...b,
          stage: 'chilled',
          status: 'Completed',
          expectedProfit: `+Rs. ${profit.toLocaleString()}`,
        };
      })
    );
  }, []);

  // Stage transition 2 -> 3: Send Chilled Dahi to Active Shop POS Counter
  const sendToPOS = useCallback((batchId) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let batchOut = 0;
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        batchOut = Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
        const rateNum = parseFloat(String(b.posRate || '').replace(/[^\d.]/g, '')) || 320;
        const rev = Math.round((b.outputVal || 0) * rateNum);
        return {
          ...b,
          stage: 'pos',
          revenueValue: `Rs. ${rev.toLocaleString()}`,
          transferredAt: timeNow,
        };
      })
    );

    // Sync into POS products stock
    if (posCtx?.setProducts && batchOut > 0) {
      posCtx.setProducts((prev) =>
        prev.map((p) => {
          if (p.category?.toLowerCase().includes('dahi') || p.name?.toLowerCase().includes('dahi') || p.id === 'PRD-DAHI-01') {
            return {
              ...p,
              stock: Number(((p.stock || 0) + batchOut).toFixed(1)),
            };
          }
          return p;
        })
      );
    }
  }, [posCtx]);

  // Mark POS batch sold out
  const markSoldOut = useCallback((batchId) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              stage: 'sold_out',
              status: 'Completed',
            }
          : b
      )
    );
  }, []);

  // Delete batch (restores milk to sourcing inventory)
  const deleteBatch = useCallback((batchId) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  }, []);

  // Clear batches
  const clearBatches = useCallback(() => {
    setBatches([]);
    localStorage.removeItem(STORAGE_KEY_DAHI);
  }, []);

  return (
    <DahiContext.Provider
      value={{
        batches,
        metrics,
        addBatch,
        moveToChiller,
        sendToPOS,
        markSoldOut,
        deleteBatch,
        clearBatches,
      }}
    >
      {children}
    </DahiContext.Provider>
  );
}

export function useDahiContext() {
  const context = useContext(DahiContext);
  if (!context) {
    throw new Error('useDahiContext must be used within a DahiProvider');
  }
  return context;
}

export default DahiContext;
