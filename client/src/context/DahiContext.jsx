import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAnimalContext } from './AnimalContext';
import { useIntakeContext } from './IntakeContext';
import { usePOSContext } from './POSContext';
import farmService from '@/services/farmService';
import api from '@/services/api';
import { broadcastSync, subscribeToSync } from '@/utils/syncBroadcaster';

const DahiContext = createContext(null);

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

  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================================
  // LIVE DAHI PRICE from POS Product Module
  // =========================================================================
  const liveDahiPosRate = useMemo(() => {
    const productList = posCtx?.products || [];
    const dahiProd = productList.find((p) => {
      const n = (p.name || '').toLowerCase();
      const c = (p.category || '').toLowerCase();
      return c.includes('dahi') || n.includes('dahi') || n.includes('yogurt') || n.includes('curd');
    });
    return dahiProd ? (Number(dahiProd.price) || Number(dahiProd.sellingPrice) || 320) : 320;
  }, [posCtx?.products]);

  // Fetch batches directly from backend database
  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await farmService.getProcessingBatches();
      const rawList = Array.isArray(data) ? data : data?.batches || [];
      const list = rawList.filter((b) => {
        const p = (b.product || '').toLowerCase();
        return p.includes('dahi') || p.includes('yogurt') || p.includes('curd') || (!p.includes('milk') && !p.includes('pasteur'));
      });
      const normalized = list.map((b) => {
        const farmUsed = Number(b.farmMilkUsed) || 0;
        const supUsed = Number(b.supplierMilkUsed) || 0;
        const totUsed = farmUsed + supUsed || Number(b.milkUsedQuantity || b.milkUsedVal) || 0;
        const src = (b.source || '').toLowerCase();
        let fRatio = 1;
        let sRatio = 0;
        if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix') && !src.includes('both')) {
          fRatio = 1;
          sRatio = 0;
        } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix') && !src.includes('both')) {
          fRatio = 0;
          sRatio = 1;
        } else {
          fRatio = totUsed > 0 && farmUsed > 0 ? Number((farmUsed / totUsed).toFixed(4)) : (b.farmRatio !== undefined ? Number(b.farmRatio) : 0.5);
          sRatio = totUsed > 0 && supUsed > 0 ? Number((supUsed / totUsed).toFixed(4)) : (b.supplierRatio !== undefined ? Number(b.supplierRatio) : 0.5);
        }

        return {
          ...b,
          id: b._id || b.id || b.batchNumber,
          batchNumber: b.batchNumber || b.id,
          outputVal: Number(b.outputQuantity || b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0,
          milkUsedVal: Number(b.milkUsedQuantity || b.milkUsedVal) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0,
          farmMilkUsed: farmUsed,
          supplierMilkUsed: supUsed,
          farmRatio: fRatio,
          supplierRatio: sRatio,
        };
      });
      setBatches(normalized);
    } catch (err) {
      console.warn('Failed to fetch processing batches from database API:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();

    const unsubscribe = subscribeToSync((event) => {
      if (
        event === 'pure_milk_bar_dahi_updated' ||
        event === 'pure_milk_bar_pos_sale_completed' ||
        event === 'pure_milk_bar_sales_updated' ||
        event === 'pure_milk_bar_inventory_updated'
      ) {
        fetchBatches();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchBatches]);

  // =========================================================================
  // 1. LIVE SOURCING NUMBERS (Milking Logs + Supplier Intakes)
  // =========================================================================
  const realFarmYield = useMemo(() => {
    let logSum = 0;
    if (Array.isArray(milkingLogs) && milkingLogs.length > 0) {
      logSum = milkingLogs.reduce((acc, log) => acc + (parseFloat(log.yieldLiters || log.yield) || 0), 0);
    }

    return Number(logSum.toFixed(1));
  }, [milkingLogs]);

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

    // Real Value-Add Net Profit: (Retail POS rate from live products - Raw milk cost) * output
    const netProfitValue = batches.reduce((acc, b) => {
      const out = Number(b.outputVal) || 0;
      const rate = parseFloat(String(b.posRate || '').replace(/[^\d.]/g, '')) || liveDahiPosRate;
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
  }, [batches, realFarmYield, realSupplierIntake, farmMilkSold, supplierMilkSold, liveDahiPosRate]);

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
        const isDahiItem = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt') || cat.includes('yogurt') || name.includes('curd') || cat.includes('curd');
        if (isDahiItem) {
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

  // Unified metrics for top KPI cards & widgets
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
  }, [realFarmYield, realSupplierIntake, conversionData, dahiSalesData, dahiTransferredToPOS, liveDahiPOSStock, liveDahiPosRate]);

  // =========================================================================
  // 3. PIPELINE ACTIONS (Synced with database)
  // =========================================================================
  // =========================================================================
  // 3. PIPELINE ACTIONS (Synced with database & instant local state)
  // =========================================================================
  const convertToDahi = useCallback(
    async (source, quantity, extraData = {}) => {
      const qty = Math.max(0, Number(quantity) || 0);
      if (qty <= 0) {
        return { success: false, message: 'Invalid quantity specified for Dahi conversion.' };
      }

      const srcStr = String(source || 'Both (Mixed)').trim().toLowerCase();
      let normSource = 'Both (Mixed)';
      let farmPortion = 0;
      let supPortion = 0;

      if (srcStr.includes('farm') && !srcStr.includes('supplier') && !srcStr.includes('both') && !srcStr.includes('mix')) {
        normSource = 'Farm Milk';
        farmPortion = qty;
        supPortion = 0;
      } else if (srcStr.includes('supplier') && !srcStr.includes('farm') && !srcStr.includes('both') && !srcStr.includes('mix')) {
        normSource = 'Supplier Milk';
        farmPortion = 0;
        supPortion = qty;
      } else {
        normSource = 'Both (Mixed)';
        if (extraData.farmMilkUsed !== undefined && extraData.supplierMilkUsed !== undefined) {
          farmPortion = Math.max(0, Number(extraData.farmMilkUsed) || 0);
          supPortion = Math.max(0, Number(extraData.supplierMilkUsed) || 0);
        } else {
          const availF = Number(metrics.remainingFarmMilk ?? realFarmYield ?? 0);
          const availS = Number(metrics.remainingSupplierMilk ?? realSupplierIntake ?? 0);
          const totalAvail = availF + availS;
          const ratio = totalAvail > 0 ? availF / totalAvail : 0.5;
          farmPortion = Math.round(qty * ratio);
          supPortion = Math.max(0, qty - farmPortion);
        }
      }

      const count = batches.length + 1;
      const batchId = `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const numOutput = extraData.outputQuantity !== undefined && extraData.outputQuantity !== null
        ? Number(extraData.outputQuantity)
        : extraData.output
          ? (parseFloat(extraData.output) || Number((qty * 0.985).toFixed(1)))
          : Number((qty * 0.985).toFixed(1));
      const calculatedOutput = `${numOutput} kg`;

      const totalMilkUsed = farmPortion + supPortion || qty;
      let farmRatio = 1;
      let supplierRatio = 0;
      if (normSource === 'Farm Milk') {
        farmRatio = 1;
        supplierRatio = 0;
      } else if (normSource === 'Supplier Milk') {
        farmRatio = 0;
        supplierRatio = 1;
      } else {
        farmRatio = totalMilkUsed > 0 ? Number((farmPortion / totalMilkUsed).toFixed(4)) : 0.5;
        supplierRatio = totalMilkUsed > 0 ? Number((supPortion / totalMilkUsed).toFixed(4)) : 0.5;
      }

      const resolvedUnitCost = Number(extraData.unitCost) || (normSource === 'Supplier Milk' ? 220 : 230);
      const resolvedDahiCostRate = Number(extraData.dahiCostRate) || 250;
      const resolvedFarmCost = Number(extraData.farmMilkCost) || (farmPortion * (normSource === 'Farm Milk' ? resolvedUnitCost : 230));
      const resolvedSupplierCost = Number(extraData.supplierMilkCost) || (supPortion * (normSource === 'Supplier Milk' ? resolvedUnitCost : 220));
      const resolvedMilkUsedCost = Number(extraData.milkCostTransferred || extraData.milkUsedCost || extraData.totalMilkCost) || (resolvedFarmCost + resolvedSupplierCost);
      const resolvedDahiProductionCost = Number(extraData.totalDahiCost || extraData.dahiProductionCost) || Math.round(numOutput * resolvedDahiCostRate);

      const rateNum = parseFloat(String(extraData.posRate || '').replace(/[^\d.]/g, '')) || liveDahiPosRate;
      const expectedProfitVal = Math.round((numOutput * rateNum) - resolvedDahiProductionCost);

      const initialStage = extraData.stage || (extraData.status === 'Completed' ? 'pos' : 'incubating');
      const initialStatus = extraData.status || (initialStage === 'pos' || initialStage === 'sold_out' ? 'Completed' : 'In Progress');

      const initialChecklist = extraData.checklist || {
        milkSourced: true,
        boiledAndCooled: initialStage !== 'incubating' ? true : (extraData.boiledAndCooled ?? true),
        starterAdded: initialStage !== 'incubating' ? true : (extraData.starterAdded ?? true),
        incubated: initialStage === 'chilled' || initialStage === 'pos' || initialStage === 'sold_out',
        chilled4C: initialStage === 'chilled' || initialStage === 'pos' || initialStage === 'sold_out',
        qualityChecked: initialStage === 'chilled' || initialStage === 'pos' || initialStage === 'sold_out',
        posTransferred: initialStage === 'pos' || initialStage === 'sold_out',
        soldOut: initialStage === 'sold_out',
      };

      const payload = {
        product: extraData.product || 'Fresh Dahi (Plain)',
        milkUsed: qty,
        milkUsedQuantity: qty,
        milkUsedLiters: qty,
        source: normSource,
        farmMilkUsed: farmPortion,
        supplierMilkUsed: supPortion,
        farmRatio,
        supplierRatio,
        unitCost: resolvedUnitCost,
        dahiCostRate: resolvedDahiCostRate,
        farmMilkCost: resolvedFarmCost,
        supplierMilkCost: resolvedSupplierCost,
        milkCostTransferred: resolvedMilkUsedCost,
        milkUsedCost: resolvedMilkUsedCost,
        totalDahiCost: resolvedDahiProductionCost,
        dahiProductionCost: resolvedDahiProductionCost,
        output: calculatedOutput,
        outputQuantity: numOutput,
        fat: extraData.fat ? String(extraData.fat).replace('%', '') : '4.5',
        date: extraData.date || new Date().toISOString().split('T')[0],
        status: initialStatus,
        stage: initialStage,
        posRate: extraData.posRate || `Rs. ${rateNum} / kg`,
        notes: extraData.notes || '',
        checklist: initialChecklist,
      };

      const newRecord = {
        ...payload,
        id: batchId,
        _id: batchId,
        time: timeNow,
        outputVal: numOutput,
        milkUsedVal: qty,
        unitCost: resolvedUnitCost,
        dahiCostRate: resolvedDahiCostRate,
        farmMilkCost: resolvedFarmCost,
        supplierMilkCost: resolvedSupplierCost,
        milkCostTransferred: resolvedMilkUsedCost,
        milkUsedCost: resolvedMilkUsedCost,
        totalDahiCost: resolvedDahiProductionCost,
        dahiProductionCost: resolvedDahiProductionCost,
        expectedProfit: `${expectedProfitVal >= 0 ? '+' : '-'}Rs. ${Math.abs(expectedProfitVal).toLocaleString()}`,
        checklist: initialChecklist,
      };

      // 1. Instantly update DahiContext local state (starts in 'incubating' stage)
      setBatches((prev) => [newRecord, ...prev]);

      // 2. Instantly call Context API setters for stock deduction
      if (typeof posCtx?.setFarmStock === 'function' && farmPortion > 0) {
        posCtx.setFarmStock((prev) => Math.max(0, Number(((prev !== null ? prev : (posCtx?.inventoryMetrics?.rawFarmMilkStock ?? 0)) - farmPortion).toFixed(1))));
      }
      if (typeof posCtx?.setSupplierStock === 'function' && supPortion > 0) {
        posCtx.setSupplierStock((prev) => Math.max(0, Number(((prev !== null ? prev : (posCtx?.inventoryMetrics?.rawSupplierMilkStock ?? 0)) - supPortion).toFixed(1))));
      }

      // 3. Instantly update POSContext (deduct source milk; only increment Dahi counter stock if initialStage is 'pos')
      if (typeof posCtx?.recordDahiConversion === 'function') {
        posCtx.recordDahiConversion({
          source: normSource,
          quantity: qty,
          farmMilkUsed: farmPortion,
          supplierMilkUsed: supPortion,
          outputQuantity: numOutput,
          batch: newRecord,
          stage: initialStage,
        });
      } else if (posCtx?.setProducts) {
        posCtx.setProducts((prev) =>
          prev.map((p) => {
            const pName = (p.name || '').toLowerCase();
            const pCat = (p.category || '').toLowerCase();
            const isDahi = pCat.includes('dahi') || pName.includes('dahi');
            const isCow = pName.includes('cow');
            const isBuff = pName.includes('buffalo');
            const isMilk = !isDahi && (pCat.includes('milk') || pName.includes('milk'));

            if (isDahi && numOutput > 0 && initialStage === 'pos') {
              return { ...p, stock: Number(((Number(p.stock) || 0) + numOutput).toFixed(2)) };
            }
            if (isMilk) {
              if (isCow && farmPortion > 0) {
                return { ...p, stock: Math.max(0, Number(((Number(p.stock) || 0) - farmPortion).toFixed(2))) };
              }
              if (isBuff) {
                const deduct = (farmPortion > 0 && !isCow ? farmPortion : 0) + supPortion;
                if (deduct > 0) {
                  return { ...p, stock: Math.max(0, Number(((Number(p.stock) || 0) - deduct).toFixed(2))) };
                }
              }
            }
            return p;
          })
        );
      }

      // 3. Persist to MongoDB backend
      try {
        const backendRes = await farmService.createProcessingBatch(payload);
        const created = backendRes?.batch || backendRes?.data || backendRes;
        if (created?._id || created?.id) {
          setBatches((prev) =>
            prev.map((b) => (b.id === batchId ? { ...b, ...created, id: created._id || created.id } : b))
          );
        }
      } catch (e) {
        console.warn('Backend API createProcessingBatch error:', e.message);
      }

      // 4. Notify global listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pure_milk_bar_dahi_updated'));
        window.dispatchEvent(new Event('pure_milk_bar_inventory_updated'));
      }
      broadcastSync('pure_milk_bar_dahi_updated');
      broadcastSync('pure_milk_bar_inventory_updated');

      return {
        success: true,
        batch: newRecord,
        farmMilkDeducted: farmPortion,
        supplierMilkDeducted: supPortion,
        dahiProduced: numOutput,
      };
    },
    [batches.length, metrics, realFarmYield, realSupplierIntake, posCtx]
  );

  const addBatch = useCallback(
    async (formData) => {
      const rawMilkNum = parseFloat(formData.milkUsedVal ?? formData.milkUsed) || 0;
      return convertToDahi(formData.source, rawMilkNum, {
        ...formData,
        stage: formData.stage || 'incubating',
        status: formData.status || 'In Progress',
      });
    },
    [convertToDahi]
  );

  // Toggle individual checklist item inside a batch
  const toggleBatchChecklist = useCallback(async (batchId, taskKey) => {
    let targetBatch = null;
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId && b._id !== batchId && b.batchNumber !== batchId) return b;
        const currentList = b.checklist || {
          milkSourced: true,
          boiledAndCooled: true,
          starterAdded: true,
          incubated: b.stage === 'chilled' || b.stage === 'pos' || b.stage === 'sold_out',
          chilled4C: b.stage === 'pos' || b.stage === 'sold_out',
          qualityChecked: b.stage === 'chilled' || b.stage === 'pos' || b.stage === 'sold_out',
          posTransferred: b.stage === 'pos' || b.stage === 'sold_out',
          soldOut: b.stage === 'sold_out',
        };
        const nextList = {
          ...currentList,
          [taskKey]: !currentList[taskKey],
        };
        targetBatch = { ...b, checklist: nextList };
        return targetBatch;
      })
    );

    if (targetBatch) {
      try {
        await farmService.updateProcessingBatch(batchId, { checklist: targetBatch.checklist });
        broadcastSync('pure_milk_bar_dahi_updated');
      } catch (e) {
        console.warn('Backend API updateProcessingBatch checklist error:', e.message);
      }
    }
  }, []);

  // Stage transition 1 -> 2: Move from Incubating to Chilled Storage
  const moveToChiller = useCallback(async (batchId) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId && b._id !== batchId && b.batchNumber !== batchId) return b;
        const rateNum = parseFloat(String(b.posRate || '').replace(/[^\d.]/g, '')) || liveDahiPosRate || 320;
        const profit = Math.round((b.outputVal || 0) * Math.max(0, rateNum - 220));
        const currentChecklist = b.checklist || {};
        return {
          ...b,
          stage: 'chilled',
          status: 'In Progress',
          expectedProfit: `+Rs. ${profit.toLocaleString()}`,
          checklist: {
            ...currentChecklist,
            milkSourced: true,
            boiledAndCooled: true,
            starterAdded: true,
            incubated: true,
            chilled4C: true,
            qualityChecked: true,
          },
        };
      })
    );

    try {
      await farmService.updateProcessingBatch(batchId, {
        stage: 'chilled',
        status: 'In Progress',
        checklist: {
          milkSourced: true,
          boiledAndCooled: true,
          starterAdded: true,
          incubated: true,
          chilled4C: true,
          qualityChecked: true,
        },
      });
      broadcastSync('pure_milk_bar_dahi_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
    } catch (e) {
      console.warn('Backend API updateProcessingBatch error:', e.message);
    }
  }, []);

  // Stage transition 2 -> 3: Send Chilled Product / Dahi to Active Shop POS Counter
  const sendToPOS = useCallback(async (batchId) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let batchOut = 0;
    let batchProduct = '';

    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId && b._id !== batchId && b.batchNumber !== batchId) return b;
        batchOut = Number(b.outputVal || b.outputQuantity) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
        batchProduct = b.product || '';
        const rateNum = parseFloat(String(b.posRate || '').replace(/[^\d.]/g, '')) || 320;
        const rev = Math.round((b.outputVal || 0) * rateNum);
        const currentChecklist = b.checklist || {};
        return {
          ...b,
          stage: 'pos',
          status: 'Completed',
          revenueValue: `Rs. ${rev.toLocaleString()}`,
          transferredAt: timeNow,
          checklist: {
            ...currentChecklist,
            milkSourced: true,
            boiledAndCooled: true,
            starterAdded: true,
            incubated: true,
            chilled4C: true,
            qualityChecked: true,
            posTransferred: true,
          },
        };
      })
    );

    try {
      await farmService.updateProcessingBatch(batchId, {
        stage: 'pos',
        status: 'Completed',
        checklist: {
          milkSourced: true,
          boiledAndCooled: true,
          starterAdded: true,
          incubated: true,
          chilled4C: true,
          qualityChecked: true,
          posTransferred: true,
        },
      });
      broadcastSync('pure_milk_bar_dahi_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
    } catch (e) {
      console.warn('Backend API updateProcessingBatch error:', e.message);
    }

    // Sync into POS products stock
    if (posCtx?.setProducts && batchOut > 0) {
      posCtx.setProducts((prev) =>
        prev.map((p) => {
          const pName = (p.name || '').toLowerCase();
          const targetName = batchProduct.toLowerCase();
          if (
            pName === targetName ||
            (targetName.includes('cow') && pName.includes('cow')) ||
            (targetName.includes('buffalo') && pName.includes('buffalo')) ||
            (targetName.includes('dahi') && pName.includes('dahi')) ||
            (targetName.includes('lassi') && pName.includes('lassi')) ||
            (targetName.includes('paneer') && pName.includes('paneer')) ||
            (targetName.includes('ghee') && pName.includes('ghee'))
          ) {
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
  const markSoldOut = useCallback(async (batchId) => {
    const target = String(batchId || '').trim();
    setBatches((prev) =>
      prev.map((b) => {
        if (
          String(b.id || '').trim() !== target &&
          String(b._id || '').trim() !== target &&
          String(b.batchNumber || '').trim() !== target
        ) {
          return b;
        }
        const currentChecklist = b.checklist || {};
        return {
          ...b,
          stage: 'sold_out',
          status: 'Completed',
          checklist: {
            ...currentChecklist,
            soldOut: true,
          },
        };
      })
    );

    try {
      await farmService.updateProcessingBatch(batchId, {
        stage: 'sold_out',
        status: 'Completed',
        checklist: {
          soldOut: true,
        },
      });
      broadcastSync('pure_milk_bar_dahi_updated');
    } catch (e) {
      console.warn('Backend API updateProcessingBatch markSoldOut error:', e.message);
    }
  }, []);

  // Move back / step back stage if needed
  const revertStage = useCallback(async (batchId, targetStage) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId && b._id !== batchId && b.batchNumber !== batchId) return b;
        return {
          ...b,
          stage: targetStage,
          status: targetStage === 'pos' || targetStage === 'sold_out' ? 'Completed' : 'In Progress',
        };
      })
    );

    try {
      await farmService.updateProcessingBatch(batchId, {
        stage: targetStage,
        status: targetStage === 'pos' || targetStage === 'sold_out' ? 'Completed' : 'In Progress',
      });
      broadcastSync('pure_milk_bar_dahi_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
    } catch (e) {
      console.warn('Backend API revertStage error:', e.message);
    }
  }, []);

  // Delete batch (restores milk to sourcing inventory)
  const deleteBatch = useCallback(async (batchId) => {
    try {
      await farmService.deleteProcessingBatch(batchId);
    } catch (e) {
      console.warn('Backend API deleteProcessingBatch error:', e.message);
    }
    setBatches((prev) => prev.filter((b) => b.id !== batchId && b._id !== batchId && b.batchNumber !== batchId));
  }, []);

  const clearBatches = useCallback(() => {
    setBatches([]);
  }, []);

  return (
    <DahiContext.Provider
      value={{
        batches,
        isLoading,
        metrics,
        refreshBatches: fetchBatches,
        addBatch,
        convertToDahi,
        toggleBatchChecklist,
        moveToChiller,
        sendToPOS,
        markSoldOut,
        revertStage,
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
