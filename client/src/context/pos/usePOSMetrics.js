import React, { useMemo } from 'react';
import { isTodayDate } from './posHelpers';

export function usePOSMetrics({
  animals = [],
  milkingLogs = [],
  intakeLogs = [],
  products = [],
  salesHistory = [],
  processingBatches = [],
  farmExpensesList = [],
  supplierExpensesList = [],
  expenseTotals = {},
  farmStock = null,
  supplierStock = null,
  posSyncVersion = 0,
}) {
  // Real farm yield from Milking Logs or active herd baseline (Overall and Split by Cow vs Buffalo)
  const { totalFarmMilk, totalFarmCowMilk, totalFarmBuffaloMilk } = useMemo(() => {
    let logSum = 0;
    let cowLogs = 0;
    let buffLogs = 0;

    const cowTagSet = new Set();
    const buffTagSet = new Set();

    animals.forEach((a) => {
      const type = (a.type || '').toUpperCase();
      const spec = (a.species || a.breed || '').toLowerCase();
      const tag = (a.tag || a.tagNumber || '').toUpperCase();
      const id = String(a.id || a._id || '');

      const isCow = type === 'COW' || spec.includes('cow') || tag.startsWith('COW');
      if (isCow) {
        if (tag) cowTagSet.add(tag);
        if (id) cowTagSet.add(id);
      } else {
        if (tag) buffTagSet.add(tag);
        if (id) buffTagSet.add(id);
      }
    });

    const seenEntries = new Set();
    const todayMilkingLogs = (milkingLogs || []).filter((l) => isTodayDate(l.date || l.createdAt));
    const effectiveMilkingLogs = todayMilkingLogs.length > 0 ? todayMilkingLogs : (milkingLogs || []);

    if (Array.isArray(effectiveMilkingLogs) && effectiveMilkingLogs.length > 0) {
      effectiveMilkingLogs.forEach((log) => {
        const y = parseFloat(log.yieldLiters || log.yield || log.quantityLiters) || 0;
        const tag = (log.animalTag || log.tag || log.animalId?.tagNumber || log.animalId?.tag || '').toUpperCase();
        const rawId = String(log.animalId?._id || log.animalId || '');
        const dateStr = log.date ? (typeof log.date === 'string' && log.date.includes('T') ? log.date.split('T')[0] : String(log.date).slice(0, 10)) : '';
        const shiftStr = (log.shift || 'Morning').toUpperCase();
        const dedupeKey = `${tag || rawId}-${dateStr}-${shiftStr}`;

        if (!seenEntries.has(dedupeKey) && y > 0) {
          seenEntries.add(dedupeKey);
          const animalObj = animals.find(a => String(a.id || a._id) === rawId || (tag && (String(a.tag || a.tagNumber).toUpperCase() === tag)));

          const isCow = (animalObj?.type || '').toUpperCase() === 'COW' ||
                        (animalObj?.species || '').toLowerCase().includes('cow') ||
                        cowTagSet.has(tag) ||
                        cowTagSet.has(rawId) ||
                        tag.startsWith('COW') ||
                        (log.animalId?.type || '').toUpperCase() === 'COW';

          logSum += y;
          if (isCow) {
            cowLogs += y;
          } else {
            buffLogs += y;
          }
        }
      });
    }

    // Incorporate any animal intakeHistory entries not present in milkingLogs
    if (Array.isArray(animals) && animals.length > 0) {
      animals.forEach((animal) => {
        const tag = (animal.tag || animal.tagNumber || '').toUpperCase();
        const id = String(animal.id || animal._id || '');
        const isCow = (animal.type || '').toUpperCase() === 'COW' ||
                      (animal.species || '').toLowerCase().includes('cow') ||
                      cowTagSet.has(tag) ||
                      cowTagSet.has(id) ||
                      tag.startsWith('COW');

        const history = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : (Array.isArray(animal.history) ? animal.history : []);
        const todayHistory = history.filter((h) => h && isTodayDate(h.date || h.createdAt));
        const effectiveHistory = todayHistory.length > 0 ? todayHistory : (todayMilkingLogs.length === 0 ? history : []);

        if (effectiveHistory.length > 0) {
          effectiveHistory.forEach((h) => {
            if (!h) return;
            const dateStr = h.date ? (typeof h.date === 'string' && h.date.includes('T') ? h.date.split('T')[0] : String(h.date).slice(0, 10)) : '';
            const shiftStr = (h.shift || (h.morning > 0 ? 'Morning' : 'Evening') || 'Morning').toUpperCase();
            const dedupeKey = `${tag || id}-${dateStr}-${shiftStr}`;
            const y = Number(h.quantityLiters ?? h.yieldLiters ?? h.yield ?? (shiftStr === 'EVENING' ? h.evening : h.morning) ?? 0) || 0;

            if (!seenEntries.has(dedupeKey) && y > 0) {
              seenEntries.add(dedupeKey);
              logSum += y;
              if (isCow) {
                cowLogs += y;
              } else {
                buffLogs += y;
              }
            }
          });
        } else if (logSum === 0) {
          const m = parseFloat(animal.morningYield || 0);
          const e = parseFloat(animal.eveningYield || 0);
          const daily = m + e;
          if (daily > 0) {
            logSum += daily;
            if (isCow) cowLogs += daily;
            else buffLogs += daily;
          }
        }
      });
    }

    return {
      totalFarmMilk: Number(logSum.toFixed(1)),
      totalFarmCowMilk: Number(cowLogs.toFixed(1)),
      totalFarmBuffaloMilk: Number(buffLogs.toFixed(1)),
    };
  }, [animals, milkingLogs, posSyncVersion]);

  // Separate Supplier Cow & Buffalo intake totals
  const { totalSupplierIntake, totalSupplierCowIntake, totalSupplierBuffaloIntake } = useMemo(() => {
    let tot = 0;
    let cowIn = 0;
    let buffIn = 0;
    const todayIntakes = (intakeLogs || []).filter((item) => isTodayDate(item.date || item.createdAt));
    const effectiveIntakes = todayIntakes.length > 0 ? todayIntakes : (intakeLogs || []);
    effectiveIntakes.forEach((item) => {
      const qty = Number(item.quantity || item.quantityLiters) || 0;
      const type = (item.milkType || '').toUpperCase();
      tot += qty;
      if (type === 'COW') {
        cowIn += qty;
      } else {
        buffIn += qty;
      }
    });
    return {
      totalSupplierIntake: Number(tot.toFixed(1)),
      totalSupplierCowIntake: Number(cowIn.toFixed(1)),
      totalSupplierBuffaloIntake: Number(buffIn.toFixed(1)),
    };
  }, [intakeLogs]);

  // Supplier procurement cost (dynamic from intake logs: totalCost OR qty * ratePerLiter)
  const supplierProcurementTotal = (intakeLogs || []).reduce((sum, item) => {
    const qty = Number(item.quantity || item.quantityLiters) || 0;
    const explicit = Number(item.totalCost ?? item.totalAmount) || 0;
    const rate = Number(item.ratePerLiter ?? item.rate ?? item.pricePerLiter) || 0;
    return sum + (explicit > 0 ? explicit : qty * rate);
  }, 0);
  const supplierAvgProcurementRate = totalSupplierIntake > 0 ? supplierProcurementTotal / totalSupplierIntake : 0;

  const milkProducts = products.filter((p) => p.category && p.category.toLowerCase().includes('milk'));
  const dahiProducts = products.filter((p) => {
    const n = (p.name || '').toLowerCase();
    const c = (p.category || '').toLowerCase();
    return c.includes('dahi') || n.includes('dahi') || n.includes('yogurt') || n.includes('curd');
  });

  const activeMilkPrice = milkProducts.length > 0 ? milkProducts[0].price : 0;

  // Dahi sale price: strictly from Product Module — null if not defined or zero
  const dahiProductEntry = dahiProducts.length > 0 ? dahiProducts[0] : null;
  const dahiSalePrice = dahiProductEntry
    ? (Number(dahiProductEntry.price) || Number(dahiProductEntry.sellingPrice) || null)
    : null;
  const isDahiPriceDefined = dahiSalePrice !== null && dahiSalePrice > 0;
  const activeDahiPrice = isDahiPriceDefined ? dahiSalePrice : 0;

  let totalMilkSold = 0;
  let totalDahiSold = 0;
  let totalMilkPrice = 0;
  let totalDahiPrice = 0;

  salesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const name = item.name ? item.name.toLowerCase() : '';
      const cat = item.category ? item.category.toLowerCase() : '';
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.subtotal) || (qty * unitPrice);

      const isDahi = cat.includes('dahi') || name.includes('dahi') || cat.includes('yogurt') || name.includes('yogurt') || cat.includes('curd') || name.includes('curd');
      const isMilk = !isDahi && (cat.includes('milk') || name.includes('milk') || cat.includes('cow') || cat.includes('buffalo') || name.includes('cow') || name.includes('buffalo'));

      if (isMilk) {
        totalMilkSold += qty;
        totalMilkPrice += lineTotal > 0 ? lineTotal : (qty * (unitPrice || activeMilkPrice));
      }
      if (isDahi) {
        totalDahiSold += qty;
        totalDahiPrice += lineTotal > 0 ? lineTotal : (qty * (unitPrice || activeDahiPrice));
      }
    });
  });

  // Critical P&L Source Attribution Logic
  const resolveItemSourceAndRatios = (item) => {
    const rawSrc = String(item.source || '').trim();
    const name = String(item.name || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    const isDahi = cat.includes('dahi') || name.includes('dahi') || cat.includes('yogurt') || name.includes('yogurt');
    const isMilk = !isDahi && (cat.includes('milk') || name.includes('milk') || cat.includes('cow') || cat.includes('buffalo') || name.includes('cow') || name.includes('buffalo'));

    if (isDahi) {
      const srcLow = rawSrc.toLowerCase();
      if (srcLow.includes('supplier')) {
        return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
      }
      if (srcLow.includes('both') || srcLow.includes('mix')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }
      if (srcLow.includes('farm')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }

      const prod = products.find((p) => p.id === item.id || p.sku === item.sku || p.name === item.name);
      const prodSrc = String(prod?.source || '').trim().toLowerCase();
      if (prodSrc.includes('supplier')) {
        return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
      }
      if (prodSrc.includes('both') || prodSrc.includes('mix')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }
      if (prodSrc.includes('farm')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }

      const dahiBatches = (processingBatches || []).filter((b) => {
        const p = (b.product || '').toLowerCase();
        return p.includes('dahi') || p.includes('yogurt');
      });
      if (dahiBatches.length > 0) {
        const latest = dahiBatches[0];
        const bSrc = String(latest.source || '').toLowerCase();
        if (bSrc.includes('supplier') && !bSrc.includes('farm') && !bSrc.includes('both') && !bSrc.includes('mix')) {
          return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
        }
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }

      if (totalFarmMilk > 0) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
    }

    const srcLow = rawSrc.toLowerCase();
    if (name.includes('supplier share') || srcLow === 'supplier') {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
    }
    if (name.includes('farm share') || srcLow === 'farm') {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }

    if (name.includes('cow') || cat.includes('cow')) {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }

    if (srcLow.includes('supplier') || name.includes('supplier') || cat.includes('supplier') || name.includes('sourced') || cat.includes('sourced') || name.includes('chilled')) {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
    }
    if (srcLow.includes('farm') || name.includes('farm')) {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }

    if (name.includes('buffalo')) {
      if (totalFarmBuffaloMilk > 0) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
      }
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
    }

    if (totalFarmMilk > 0) {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }
    return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
  };

  // Isolated Farm Sales
  const farmSalesHistory = useMemo(() => {
    return salesHistory
      .map((sale) => {
        const farmItems = (sale.items || [])
          .map((item) => {
            const { source } = resolveItemSourceAndRatios(item);
            const totalItemRev = Number(item.subtotal) || ((Number(item.quantity) || 0) * (Number(item.price) || 0));
            const totalItemQty = Number(item.quantity) || 0;

            let lineRev = 0;
            let lineQty = 0;

            if (item.farmRevenue !== undefined && Number(item.farmRevenue) > 0) {
              lineRev = Number(item.farmRevenue);
              lineQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) : totalItemQty;
            } else if (item.farmRatio !== undefined && Number(item.farmRatio) > 0) {
              lineRev = Math.round(Number(item.farmRatio) * totalItemRev);
              lineQty = Number((Number(item.farmRatio) * totalItemQty).toFixed(2));
            } else if (source === 'Farm') {
              lineRev = totalItemRev;
              lineQty = totalItemQty;
            }

            if (lineRev <= 0 && lineQty <= 0) return null;

            return {
              ...item,
              quantity: lineQty,
              source: 'Farm',
              effectiveRevenue: lineRev,
              subtotal: lineRev,
            };
          })
          .filter(Boolean);

        if (farmItems.length === 0) return null;
        const farmTotal = farmItems.reduce((s, i) => s + (Number(i.effectiveRevenue) || 0), 0);
        return {
          ...sale,
          items: farmItems,
          subtotal: farmTotal,
          netPayable: farmTotal,
          isFarmSale: true,
        };
      })
      .filter(Boolean);
  }, [salesHistory, products, processingBatches, totalFarmMilk, totalFarmCowMilk, totalFarmBuffaloMilk]);

  // Isolated Supplier Sales
  const supplierSalesHistory = useMemo(() => {
    return salesHistory
      .map((sale) => {
        const supItems = (sale.items || [])
          .map((item) => {
            const { source } = resolveItemSourceAndRatios(item);
            const totalItemRev = Number(item.subtotal) || ((Number(item.quantity) || 0) * (Number(item.price) || 0));
            const totalItemQty = Number(item.quantity) || 0;

            let lineRev = 0;
            let lineQty = 0;

            if (item.supplierRevenue !== undefined && Number(item.supplierRevenue) > 0) {
              lineRev = Number(item.supplierRevenue);
              lineQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) : totalItemQty;
            } else if (item.supplierRatio !== undefined && Number(item.supplierRatio) > 0) {
              lineRev = Math.round(Number(item.supplierRatio) * totalItemRev);
              lineQty = Number((Number(item.supplierRatio) * totalItemQty).toFixed(2));
            } else if (source === 'Supplier') {
              lineRev = totalItemRev;
              lineQty = totalItemQty;
            }

            if (lineRev <= 0 && lineQty <= 0) return null;

            return {
              ...item,
              quantity: lineQty,
              source: 'Supplier',
              effectiveRevenue: lineRev,
              subtotal: lineRev,
            };
          })
          .filter(Boolean);

        if (supItems.length === 0) return null;
        const supTotal = supItems.reduce((s, i) => s + (Number(i.effectiveRevenue) || 0), 0);
        return {
          ...sale,
          items: supItems,
          subtotal: supTotal,
          netPayable: supTotal,
          isSupplierSale: true,
        };
      })
      .filter(Boolean);
  }, [salesHistory, products, processingBatches, totalFarmMilk, totalFarmCowMilk, totalFarmBuffaloMilk]);

  const farmStats = {
    milkSold: 0,
    dahiSold: 0,
    otherSold: 0,
    milkRevenue: 0,
    dahiRevenue: 0,
    totalRevenue: 0,
    totalCost: 0,
    itemizedProducts: {},
  };

  const supplierStats = {
    milkSold: 0,
    dahiSold: 0,
    otherSold: 0,
    milkRevenue: 0,
    dahiRevenue: 0,
    totalRevenue: 0,
    totalCost: 0,
    itemizedProducts: {},
  };

  farmSalesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const { isDahi, isMilk } = resolveItemSourceAndRatios(item);
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.effectiveRevenue ?? item.subtotal) || (qty * unitPrice);
      // Client rule: Farm milk/dahi has NO cost price
      const unitCost = 0;

      if (isMilk) {
        farmStats.milkSold += qty;
        farmStats.milkRevenue += lineTotal;
      } else if (isDahi) {
        farmStats.dahiSold += qty;
        farmStats.dahiRevenue += lineTotal;
      } else {
        farmStats.otherSold += qty;
      }
      farmStats.totalRevenue += lineTotal;
      farmStats.totalCost += Math.round(qty * unitCost);

      const pName = item.name || (isMilk ? 'Farm Milk' : 'Farm Dahi');
      if (!farmStats.itemizedProducts[pName]) {
        farmStats.itemizedProducts[pName] = {
          id: item.id || pName,
          name: pName,
          category: item.category || (isMilk ? 'Milk' : 'Dahi'),
          unit: item.unit || (isMilk ? 'per liter' : 'per kg'),
          source: 'Farm',
          qtySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          avgRate: unitPrice,
          unitCost,
        };
      }
      farmStats.itemizedProducts[pName].qtySold += qty;
      farmStats.itemizedProducts[pName].totalRevenue += lineTotal;
      farmStats.itemizedProducts[pName].totalCost += Math.round(qty * unitCost);
    });
  });

  supplierSalesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const { isDahi, isMilk } = resolveItemSourceAndRatios(item);
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.effectiveRevenue ?? item.subtotal) || (qty * unitPrice);
      // Supplier unit cost = dynamic average procurement rate from intake logs
      const unitCost = supplierAvgProcurementRate;

      if (isMilk) {
        supplierStats.milkSold += qty;
        supplierStats.milkRevenue += lineTotal;
      } else if (isDahi) {
        supplierStats.dahiSold += qty;
        supplierStats.dahiRevenue += lineTotal;
      } else {
        supplierStats.otherSold += qty;
      }
      supplierStats.totalRevenue += lineTotal;
      supplierStats.totalCost += Math.round(qty * unitCost);

      const pName = item.name || (isMilk ? 'Supplier Milk' : 'Supplier Dahi');
      if (!supplierStats.itemizedProducts[pName]) {
        supplierStats.itemizedProducts[pName] = {
          id: item.id || pName,
          name: pName,
          category: item.category || (isMilk ? 'Milk' : 'Dahi'),
          unit: item.unit || (isMilk ? 'per liter' : 'per kg'),
          source: 'Supplier',
          qtySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          avgRate: unitPrice,
          unitCost,
        };
      }
      supplierStats.itemizedProducts[pName].qtySold += qty;
      supplierStats.itemizedProducts[pName].totalRevenue += lineTotal;
      supplierStats.itemizedProducts[pName].totalCost += Math.round(qty * unitCost);
    });
  });

  // Live Expenses and Procurement Outflows
  const farmExpensesTotal = expenseTotals?.totalFarmExpense ?? (farmExpensesList || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const supplierExpensesTotal = (supplierExpensesList || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const supplierTotalCosts = supplierProcurementTotal + supplierExpensesTotal;

  // Dahi Production Cost calculation strictly segregated by source:
  let farmDahiProductionCost = 0;
  let supplierDahiProductionCost = 0;
  let farmMilkCostTransferred = 0;
  let supplierMilkCostTransferred = 0;

  // Client rule: Farm milk & dahi carry NO cost price. Supplier milk cost is already
  // fully captured in procurement (intake logs), so dahi made from supplier milk adds
  // no extra hardcoded cost. No fallback rates are used anywhere.
  const farmProcessingDeltaCost = 0;
  const supplierProcessingDeltaCost = 0;

  const farmDahiActualNetProfit = farmStats.dahiRevenue - farmDahiProductionCost;
  const supplierDahiActualNetProfit = supplierStats.dahiRevenue - supplierDahiProductionCost;

  // farmNetProfit = farmRawMilkRevenue + farmDahiRevenue (+ other farm items) - Total Farm Expenses
  const farmTotalIncome = farmStats.totalRevenue;
  const farmNetProfit = farmTotalIncome - farmExpensesTotal;
  const farmNetMargin = farmTotalIncome > 0 ? Math.round((farmNetProfit / farmTotalIncome) * 100) : 0;
  const farmRealizationPerLiter = farmStats.milkSold > 0 ? Number((farmNetProfit / farmStats.milkSold).toFixed(2)) : 0;

  const farmSalesMetrics = {
    source: 'Farm',
    label: 'In-House Dairy Farm',
    milkSold: Number(farmStats.milkSold.toFixed(1)),
    dahiSold: Number(farmStats.dahiSold.toFixed(1)),
    otherSold: Number(farmStats.otherSold.toFixed(1)),
    milkRevenue: farmStats.milkRevenue,
    dahiRevenue: farmStats.dahiRevenue,
    totalRevenue: farmTotalIncome,
    totalIncome: farmTotalIncome,
    income: farmTotalIncome,
    dahiProductionCost: farmDahiProductionCost,
    milkUsedCost: farmMilkCostTransferred,
    milkCostTransferred: farmMilkCostTransferred,
    processingDeltaCost: farmProcessingDeltaCost,
    dahiNetProfit: farmDahiActualNetProfit,
    actualNetProfit: farmDahiActualNetProfit,
    totalExpenses: farmExpensesTotal,
    expenses: farmExpensesTotal,
    totalCost: farmExpensesTotal + farmProcessingDeltaCost,
    grossProfit: farmTotalIncome,
    grossMarginPercent: farmTotalIncome > 0 ? 100 : 0,
    allocatedOverhead: 0,
    netProfit: farmNetProfit,
    netMarginPercent: farmNetMargin,
    realizationPerLiter: farmRealizationPerLiter,
    itemizedProducts: Object.values(farmStats.itemizedProducts),
  };

  const supplierTotalIncome = supplierStats.totalRevenue;
  // supplierNetProfit = supplierRevenue - (Total Supplier Intake Qty * Procurement Price) - recorded supplier expenses
  const supplierNetProfit = supplierTotalIncome - supplierTotalCosts;
  const supplierNetMargin = supplierTotalIncome > 0 ? Math.round((supplierNetProfit / supplierTotalIncome) * 100) : 0;
  const supplierRealizationPerLiter = supplierStats.milkSold > 0 ? Number((supplierNetProfit / supplierStats.milkSold).toFixed(2)) : 0;

  const supplierSalesMetrics = {
    source: 'Supplier',
    label: 'Supplier Procured Sourcing',
    milkSold: Number(supplierStats.milkSold.toFixed(1)),
    dahiSold: Number(supplierStats.dahiSold.toFixed(1)),
    otherSold: Number(supplierStats.otherSold.toFixed(1)),
    milkRevenue: supplierStats.milkRevenue,
    dahiRevenue: supplierStats.dahiRevenue,
    totalRevenue: supplierTotalIncome,
    totalIncome: supplierTotalIncome,
    income: supplierTotalIncome,
    dahiProductionCost: supplierDahiProductionCost,
    milkUsedCost: supplierMilkCostTransferred,
    milkCostTransferred: supplierMilkCostTransferred,
    processingDeltaCost: supplierProcessingDeltaCost,
    dahiNetProfit: supplierDahiActualNetProfit,
    actualNetProfit: supplierDahiActualNetProfit,
    purchaseCost: supplierProcurementTotal,
    procurementCost: supplierProcurementTotal,
    supplierExpenses: supplierExpensesTotal,
    totalExpenses: supplierExpensesTotal,
    totalCost: supplierTotalCosts + supplierProcessingDeltaCost,
    totalCosts: supplierTotalCosts + supplierProcessingDeltaCost,
    grossProfit: supplierTotalIncome - supplierProcurementTotal,
    grossMarginPercent: supplierTotalIncome > 0 ? Math.round(((supplierTotalIncome - supplierProcurementTotal) / supplierTotalIncome) * 100) : 0,
    allocatedOverhead: 0,
    netProfit: supplierNetProfit,
    netMarginPercent: supplierNetMargin,
    realizationPerLiter: supplierRealizationPerLiter,
    itemizedProducts: Object.values(supplierStats.itemizedProducts),
  };

  const totalBusinessNetProfit = farmNetProfit + supplierNetProfit;
  const totalBusinessRevenue = farmTotalIncome + supplierTotalIncome;
  const totalBusinessCosts = farmExpensesTotal + farmProcessingDeltaCost + supplierTotalCosts + supplierProcessingDeltaCost;
  const totalBusinessMargin = totalBusinessRevenue > 0 ? Math.round((totalBusinessNetProfit / totalBusinessRevenue) * 100) : 0;

  const totalDahiRevenue = farmStats.dahiRevenue + supplierStats.dahiRevenue;
  const totalDahiProductionCost = farmDahiProductionCost + supplierDahiProductionCost;
  const totalDahiNetProfit = farmDahiActualNetProfit + supplierDahiActualNetProfit;

  // Safety: if dahi price not defined in product module, dahiRevenue = 0
  const safeTotalDahiRevenue = isDahiPriceDefined ? totalDahiRevenue : 0;
  const safeTotalDahiNetProfit = isDahiPriceDefined ? totalDahiNetProfit : 0;

  const businessFinancialMetrics = {
    farmNetProfit,
    farmTotalIncome,
    farmExpenses: farmExpensesTotal,
    farmProcessingDeltaCost,
    supplierNetProfit,
    supplierTotalIncome,
    supplierProcurementCost: supplierProcurementTotal,
    supplierExpenses: supplierExpensesTotal,
    supplierTotalCosts,
    supplierProcessingDeltaCost,
    totalBusinessNetProfit,
    totalBusinessRevenue,
    totalBusinessCosts,
    totalBusinessMargin,
    // Dahi-specific (safe: 0 when price not defined)
    totalDahiRevenue: safeTotalDahiRevenue,
    totalDahiProductionCost,
    totalDahiNetProfit: safeTotalDahiNetProfit,
    totalDahiSold: farmStats.dahiSold + supplierStats.dahiSold,
    // Live product module fields for conditional rendering
    dahiSalePrice,          // null if not set in Product Module
    isDahiPriceDefined,     // true/false — used for conditional UI
    dahiProductName: dahiProductEntry?.name || null,
  };

  // Processing batch stock aggregations
  let farmMilkConvertedToDahi = 0;
  let supplierMilkConvertedToDahi = 0;
  let totalDahiTransferredToPOS = 0;
  let totalDahiChilledInKitchen = 0;
  let processedCowMilkStock = 0;
  let processedBuffaloMilkStock = 0;
  let totalProcessedMilk = 0;
  const batchProductStockMap = {};

  (processingBatches || []).forEach((b) => {
    const isLogToday = !b.createdAt && !b.date
      ? true
      : (isTodayDate(b.createdAt) || isTodayDate(b.date));
    
    if (!isLogToday) return;

    const pName = (b.product || '').toLowerCase();
    const isDahi = pName.includes('dahi') || pName.includes('yogurt') || pName.includes('curd');
    const isMilk = pName.includes('milk') && !isDahi;
    const isCow = pName.includes('cow');
    const isBuff = pName.includes('buffalo');

    const numUsed = Number(b.milkUsedQuantity || b.milkUsedVal || b.milkUsedLiters) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
    const outNum = Number(b.outputQuantity || b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;

    if (isDahi || (!isMilk && numUsed > 0)) {
      if (b.farmMilkUsed !== undefined && b.supplierMilkUsed !== undefined) {
        farmMilkConvertedToDahi += Number(b.farmMilkUsed) || 0;
        supplierMilkConvertedToDahi += Number(b.supplierMilkUsed) || 0;
      } else {
        const src = (b.source || '').toLowerCase();
        if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix')) {
          farmMilkConvertedToDahi += numUsed;
        } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix')) {
          supplierMilkConvertedToDahi += numUsed;
        } else {
          const totalSourced = totalFarmMilk + totalSupplierIntake;
          const ratio = totalSourced > 0 ? totalFarmMilk / totalSourced : 0.5;
          const fPortion = Math.round(numUsed * ratio);
          farmMilkConvertedToDahi += fPortion;
          supplierMilkConvertedToDahi += Math.max(0, numUsed - fPortion);
        }
      }
    }

    const bStatus = String(b.status || '').toLowerCase();
    const bStage = String(b.stage || '').toLowerCase();
    const isTransferredToPOS = bStage === 'pos' || bStatus === 'pos' || bStatus === 'ready_for_pos';
    const isChilledInKitchen = bStage === 'chilled' || (bStatus === 'completed' && !isTransferredToPOS);
    const isReadyMilk = isTransferredToPOS || ['completed', 'ready_for_pos'].includes(bStatus) || ['completed'].includes(bStage);

    if (outNum > 0) {
      if (isDahi) {
        if (isTransferredToPOS) {
          totalDahiTransferredToPOS += outNum;
        } else if (isChilledInKitchen) {
          totalDahiChilledInKitchen += outNum;
        }
      } else if (isMilk && isReadyMilk) {
        totalProcessedMilk += outNum;
        if (isCow) {
          processedCowMilkStock += outNum;
        } else if (isBuff) {
          processedBuffaloMilkStock += outNum;
        } else {
          processedCowMilkStock += outNum / 2;
          processedBuffaloMilkStock += outNum / 2;
        }
      }

      if (isTransferredToPOS) {
        const rawName = b.product || 'Product';
        batchProductStockMap[rawName] = (batchProductStockMap[rawName] || 0) + outNum;
      }
    }
  });

  let todayFarmMilkSold = 0;
  let todayFarmCowMilkSold = 0;
  let todayFarmBuffaloMilkSold = 0;
  let todaySupplierMilkSold = 0;
  let todaySupplierCowMilkSold = 0;
  let todaySupplierBuffaloMilkSold = 0;

  salesHistory.forEach((sale) => {
    const isToday = !sale.timestamp && !sale.date && !sale.createdAt
      ? true
      : (isTodayDate(sale.timestamp) || isTodayDate(sale.date) || isTodayDate(sale.createdAt));

    if (isToday) {
      (sale.items || []).forEach((item) => {
        const { source: src } = resolveItemSourceAndRatios(item);
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        
        const isMilk = cat.includes('milk') || name.includes('milk') || cat.includes('buffalo') || cat.includes('cow') || name.includes('buffalo') || name.includes('cow');
        
        if (isMilk) {
          const isCow = name.includes('cow') || cat.includes('cow');
          let fQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) || 0 : (src === 'Farm' ? qty : 0);
          let sQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) || 0 : (src === 'Supplier' ? qty : 0);
          if (fQty === 0 && sQty === 0) {
            if (src === 'Supplier') sQty = qty;
            else fQty = qty;
          }

          // Deduct ONLY from the stock of the selected source
          todayFarmMilkSold += fQty;
          todaySupplierMilkSold += sQty;
          if (isCow) {
            todayFarmCowMilkSold += fQty;
            todaySupplierCowMilkSold += sQty;
          } else {
            todayFarmBuffaloMilkSold += fQty;
            todaySupplierBuffaloMilkSold += sQty;
          }
        }
      });
    }
  });

  let todaySupplierIntake = 0;
  let todaySupplierCowIntake = 0;
  let todaySupplierBuffaloIntake = 0;
  
  (intakeLogs || []).forEach((item) => {
    const isLogToday = isTodayDate(item.date || item.createdAt);
    if (isLogToday) {
      const qty = Number(item.quantity || item.quantityLiters) || 0;
      const type = (item.milkType || '').toUpperCase();
      todaySupplierIntake += qty;
      if (type === 'COW') todaySupplierCowIntake += qty;
      else todaySupplierBuffaloIntake += qty;
    }
  });

  // Direct Product Catalog Stock from MongoDB Products Collection
  const catalogFarmMilkStock = useMemo(() => {
    return (products || []).reduce((sum, p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const isMilk = cat.includes('milk') || name.includes('milk');
      const isSupplier = String(p.source || '').toLowerCase().includes('supplier');
      if (isMilk && !isSupplier) {
        return sum + Math.max(0, Number(p.currentStock ?? p.stock) || 0);
      }
      return sum;
    }, 0);
  }, [products]);

  const catalogSupplierMilkStock = useMemo(() => {
    return (products || []).reduce((sum, p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const isMilk = cat.includes('milk') || name.includes('milk');
      const isSupplier = String(p.source || '').toLowerCase().includes('supplier');
      if (isMilk && isSupplier) {
        return sum + Math.max(0, Number(p.currentStock ?? p.stock) || 0);
      }
      return sum;
    }, 0);
  }, [products]);

  const totalFarmMilkSoldQty = todayFarmMilkSold;
  const totalFarmMilkStockBasis = totalFarmMilk + catalogFarmMilkStock;
  const calculatedAvailableFarmStock = Math.max(0, Number((totalFarmMilkStockBasis - totalFarmMilkSoldQty - farmMilkConvertedToDahi).toFixed(1)));
  const availableFarmStock = calculatedAvailableFarmStock;
  const remainingFarmMilk = availableFarmStock;

  const totalSupplierMilkSoldQty = todaySupplierMilkSold;
  const totalSupplierIntakeBasis = totalSupplierIntake + catalogSupplierMilkStock;
  const calculatedRemainingSupplierMilk = Math.max(0, Number((totalSupplierIntakeBasis - totalSupplierMilkSoldQty - supplierMilkConvertedToDahi).toFixed(1)));
  const remainingSupplierMilk = calculatedRemainingSupplierMilk;
  const remainingTotalMilk = Number((remainingFarmMilk + remainingSupplierMilk + totalProcessedMilk).toFixed(1));

  const preDahiCow = Math.max(0, totalFarmCowMilk - todayFarmCowMilkSold + processedCowMilkStock);
  const preDahiBuff = Math.max(0, (totalFarmBuffaloMilk + catalogFarmMilkStock) - todayFarmBuffaloMilkSold + processedBuffaloMilkStock);
  
  const buffDeduction = Math.min(preDahiBuff, farmMilkConvertedToDahi);
  const cowDeduction = Math.max(0, farmMilkConvertedToDahi - buffDeduction);
  
  const remainingFarmCowMilk = Math.max(0, Number((preDahiCow - cowDeduction).toFixed(1)));
  const remainingFarmBuffaloMilk = Math.max(0, Number((preDahiBuff - buffDeduction).toFixed(1)));

  const effectiveSupplierCow = totalSupplierCowIntake > 0 ? totalSupplierCowIntake : todaySupplierCowIntake;
  const effectiveSupplierBuffalo = (totalSupplierBuffaloIntake > 0 ? totalSupplierBuffaloIntake : todaySupplierBuffaloIntake) + catalogSupplierMilkStock;

  const preDahiSupCow = Math.max(0, effectiveSupplierCow - todaySupplierCowMilkSold);
  const preDahiSupBuff = Math.max(0, effectiveSupplierBuffalo - todaySupplierBuffaloMilkSold);

  const supBuffDeduction = Math.min(preDahiSupBuff, supplierMilkConvertedToDahi);
  const supCowDeduction = Math.max(0, supplierMilkConvertedToDahi - supBuffDeduction);

  const remainingSupplierCowMilk = Math.max(0, Number((preDahiSupCow - supCowDeduction).toFixed(1)));
  const remainingSupplierBuffaloMilk = Math.max(0, Number((preDahiSupBuff - supBuffDeduction).toFixed(1)));

  const availableDahiStock = Math.max(0, Number((totalDahiTransferredToPOS - totalDahiSold).toFixed(1)));

  const dahiExtraMarginPerKg = Math.max(0, (Number(activeDahiPrice) || 0) - (Number(activeMilkPrice) || 0));
  const dahiRealizedExtraProfit = Math.round(totalDahiSold * dahiExtraMarginPerKg);
  const dahiTotalExtraProfit = Math.round(totalDahiTransferredToPOS * dahiExtraMarginPerKg);

  const inventoryMetrics = {
    availableFarmStock: availableFarmStock % 1 === 0 ? availableFarmStock.toFixed(0) : availableFarmStock.toFixed(1),
    rawAvailableFarmStock: availableFarmStock,
    todayFarmMilkSold: Number(todayFarmMilkSold.toFixed(2)),
    todaySupplierMilkSold: Number(todaySupplierMilkSold.toFixed(2)),
    todaySupplierIntake,
    totalFarmYield: totalFarmMilk,
    totalFarmCowYield: totalFarmCowMilk,
    totalFarmBuffaloYield: totalFarmBuffaloMilk,
    farmMilkStock: availableFarmStock % 1 === 0 ? availableFarmStock.toFixed(0) : availableFarmStock.toFixed(1),
    farmCowMilkStock: remainingFarmCowMilk % 1 === 0 ? remainingFarmCowMilk.toFixed(0) : remainingFarmCowMilk.toFixed(1),
    farmBuffaloMilkStock: remainingFarmBuffaloMilk % 1 === 0 ? remainingFarmBuffaloMilk.toFixed(0) : remainingFarmBuffaloMilk.toFixed(1),
    totalMilk: remainingTotalMilk % 1 === 0 ? remainingTotalMilk.toFixed(0) : remainingTotalMilk.toFixed(1),
    totalMilkStock: remainingTotalMilk % 1 === 0 ? remainingTotalMilk.toFixed(0) : remainingTotalMilk.toFixed(1),
    totalSupplierIntake,
    totalSupplierCowIntake,
    totalSupplierBuffaloIntake,
    supplierMilkStock: remainingSupplierMilk % 1 === 0 ? remainingSupplierMilk.toFixed(0) : remainingSupplierMilk.toFixed(1),
    supplierCowMilkStock: remainingSupplierCowMilk % 1 === 0 ? remainingSupplierCowMilk.toFixed(0) : remainingSupplierCowMilk.toFixed(1),
    supplierBuffaloMilkStock: remainingSupplierBuffaloMilk % 1 === 0 ? remainingSupplierBuffaloMilk.toFixed(0) : remainingSupplierBuffaloMilk.toFixed(1),
    totalDahi: availableDahiStock % 1 === 0 ? availableDahiStock.toFixed(0) : availableDahiStock.toFixed(1),
    totalDahiStock: availableDahiStock % 1 === 0 ? availableDahiStock.toFixed(0) : availableDahiStock.toFixed(1),
    totalDahiTransferred: totalDahiTransferredToPOS % 1 === 0 ? totalDahiTransferredToPOS.toFixed(0) : totalDahiTransferredToPOS.toFixed(1),
    chilledDahiStock: totalDahiChilledInKitchen % 1 === 0 ? totalDahiChilledInKitchen.toFixed(0) : totalDahiChilledInKitchen.toFixed(1),
    rawFarmMilkStock: availableFarmStock,
    rawFarmCowMilkStock: remainingFarmCowMilk,
    rawFarmBuffaloMilkStock: remainingFarmBuffaloMilk,
    rawSupplierMilkStock: remainingSupplierMilk,
    rawSupplierCowMilkStock: remainingSupplierCowMilk,
    rawSupplierBuffaloMilkStock: remainingSupplierBuffaloMilk,
    rawTotalMilkStock: remainingTotalMilk,
    rawDahiStock: availableDahiStock,
    rawChilledDahiStock: totalDahiChilledInKitchen,
    totalFarmMilkIntake: totalFarmMilk,
    totalFarmMilkSold: totalFarmMilkSoldQty,
    totalFarmMilkConvertedToDahi: farmMilkConvertedToDahi,
    milkSold: (totalMilkSold % 1 === 0 ? totalMilkSold.toFixed(0) : totalMilkSold.toFixed(2)),
    dahiSold: (totalDahiSold % 1 === 0 ? totalDahiSold.toFixed(0) : totalDahiSold.toFixed(2)),
    totalMilkPrice,
    totalDahiPrice,
    dahiExtraProfit: dahiRealizedExtraProfit,
    dahiTotalPotentialExtraProfit: dahiTotalExtraProfit,
    milkPrice: activeMilkPrice,
    dahiPrice: activeDahiPrice,
    productBatchStockMap: batchProductStockMap,
  };

  return {
    totalFarmMilk,
    totalFarmCowMilk,
    totalFarmBuffaloMilk,
    remainingFarmBuffaloMilk,
    totalSupplierIntake,
    totalSupplierCowIntake,
    totalSupplierBuffaloIntake,
    resolveItemSourceAndRatios,
    farmSalesHistory,
    supplierSalesHistory,
    farmSalesMetrics,
    supplierSalesMetrics,
    businessFinancialMetrics,
    inventoryMetrics,
  };
}
