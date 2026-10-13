import React, { useMemo, useEffect } from 'react';
import { isTodayDate } from './posHelpers';
import { normalizeDateStr, getActiveBusinessDate, getLocalDate } from '../../utils/dateUtils';

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
  openingStock = {},
  activeDate = null,
  isDayClosed = false,
  updateClosingStock = null,
}) {
  const targetActiveDate = activeDate || getActiveBusinessDate();

  // Filter sales strictly belonging to the active business day for fresh P&L calculation
  const activeSalesHistory = useMemo(() => {
    return (salesHistory || []).filter((sale) => {
      if (!sale) return false;
      const sDate = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
      if (targetActiveDate) {
        return sDate === targetActiveDate;
      }
      return isTodayDate(sale.timestamp || sale.date || sale.createdAt, targetActiveDate);
    });
  }, [salesHistory, targetActiveDate]);

  // Real farm yield from Milking Logs (both Active Day and All-Time for cold-start inventory)
  const {
    totalFarmMilk,
    totalFarmCowMilk,
    totalFarmBuffaloMilk,
    allTimeFarmMilk,
    allTimeFarmCowMilk,
    allTimeFarmBuffaloMilk,
  } = useMemo(() => {
    let todayLogSum = 0;
    let todayCowLogs = 0;
    let todayBuffLogs = 0;
    let allTimeLogSum = 0;
    let allTimeCowLogs = 0;
    let allTimeBuffLogs = 0;

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
<<<<<<< HEAD
    const todayMilkingLogs = (milkingLogs || []).filter((l) => isTodayDate(l.date || l.createdAt));

    if (Array.isArray(todayMilkingLogs) && todayMilkingLogs.length > 0) {
      todayMilkingLogs.forEach((log) => {
=======
    const seenLogIds = new Set();

    if (Array.isArray(milkingLogs) && milkingLogs.length > 0) {
      milkingLogs.forEach((log) => {
        const logId = String(log._id || log.id || '');
        if (logId) seenLogIds.add(logId);
>>>>>>> farman
        const y = parseFloat(log.yieldLiters || log.yield || log.quantityLiters) || 0;
        const tag = (log.animalTag || log.tag || log.animalId?.tagNumber || log.animalId?.tag || '').toUpperCase();
        const rawId = String(log.animalId?._id || log.animalId || '');
        const animalObj = animals.find(a => String(a.id || a._id) === rawId || (tag && (String(a.tag || a.tagNumber).toUpperCase() === tag)));
        const canonicalTag = (animalObj?.tag || animalObj?.tagNumber || tag || rawId).toUpperCase();
        const dateStr = normalizeDateStr(log.date || log.createdAt) || '';
        const shiftStr = (log.shift || 'Morning').toUpperCase();
        const dedupeKey = `${canonicalTag}-${dateStr}-${shiftStr}`;

        if (!seenEntries.has(dedupeKey) && y > 0) {
          seenEntries.add(dedupeKey);

          const isCow = (animalObj?.type || '').toUpperCase() === 'COW' ||
                        (animalObj?.species || '').toLowerCase().includes('cow') ||
                        cowTagSet.has(canonicalTag) ||
                        cowTagSet.has(rawId) ||
                        canonicalTag.startsWith('COW') ||
                        (log.animalId?.type || '').toUpperCase() === 'COW';

          allTimeLogSum += y;
          if (isCow) allTimeCowLogs += y;
          else allTimeBuffLogs += y;

          if (dateStr === targetActiveDate) {
            todayLogSum += y;
            if (isCow) todayCowLogs += y;
            else todayBuffLogs += y;
          }
        }
      });
    }

<<<<<<< HEAD
    // Incorporate any animal intakeHistory entries strictly dated today
=======
    // Incorporate any animal intakeHistory entries
>>>>>>> farman
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

        if (todayHistory.length > 0) {
          todayHistory.forEach((h) => {
            if (!h) return;
            const dateStr = normalizeDateStr(h.date || h.createdAt) || '';
            const shiftStr = (h.shift || (h.morning > 0 ? 'Morning' : 'Evening') || 'Morning').toUpperCase();
            const y = Number(h.quantityLiters ?? h.yieldLiters ?? h.yield ?? (shiftStr === 'EVENING' ? h.evening : h.morning) ?? 0) || 0;
            const dedupeKey = `${tag || id}-${dateStr}-${shiftStr}`;

            if (!seenEntries.has(dedupeKey) && y > 0) {
              seenEntries.add(dedupeKey);
              allTimeLogSum += y;
              if (isCow) allTimeCowLogs += y;
              else allTimeBuffLogs += y;

              if (dateStr === targetActiveDate) {
                todayLogSum += y;
                if (isCow) todayCowLogs += y;
                else todayBuffLogs += y;
              }
            }
          });
        }
      });
    }

    return {
      totalFarmMilk: Number(todayLogSum.toFixed(1)),
      totalFarmCowMilk: Number(todayCowLogs.toFixed(1)),
      totalFarmBuffaloMilk: Number(todayBuffLogs.toFixed(1)),
      allTimeFarmMilk: Number(allTimeLogSum.toFixed(1)),
      allTimeFarmCowMilk: Number(allTimeCowLogs.toFixed(1)),
      allTimeFarmBuffaloMilk: Number(allTimeBuffLogs.toFixed(1)),
    };
  }, [animals, milkingLogs, posSyncVersion, targetActiveDate]);

  // Separate Supplier Cow & Buffalo intake totals (both Active Day and All-Time)
  const {
    totalSupplierIntake,
    totalSupplierCowIntake,
    totalSupplierBuffaloIntake,
    allTimeSupplierIntake,
    allTimeSupplierCowIntake,
    allTimeSupplierBuffaloIntake,
  } = useMemo(() => {
    let todayTot = 0;
    let todayCow = 0;
    let todayBuff = 0;
    let allTot = 0;
    let allCow = 0;
    let allBuff = 0;

<<<<<<< HEAD
  // Separate Supplier Cow & Buffalo intake totals for today
  const { totalSupplierIntake, totalSupplierCowIntake, totalSupplierBuffaloIntake } = useMemo(() => {
    let tot = 0;
    let cowIn = 0;
    let buffIn = 0;
    const todayIntakes = (intakeLogs || []).filter((item) => isTodayDate(item.date || item.createdAt));
    todayIntakes.forEach((item) => {
=======
    (intakeLogs || []).forEach((item) => {
      const dateStr = normalizeDateStr(item.date || item.createdAt);
>>>>>>> farman
      const qty = Number(item.quantity || item.quantityLiters) || 0;
      const type = (item.milkType || '').toUpperCase();

      allTot += qty;
      if (type === 'COW') allCow += qty;
      else allBuff += qty;

      if (dateStr === targetActiveDate) {
        todayTot += qty;
        if (type === 'COW') todayCow += qty;
        else todayBuff += qty;
      }
    });

    return {
      totalSupplierIntake: Number(todayTot.toFixed(1)),
      totalSupplierCowIntake: Number(todayCow.toFixed(1)),
      totalSupplierBuffaloIntake: Number(todayBuff.toFixed(1)),
      allTimeSupplierIntake: Number(allTot.toFixed(1)),
      allTimeSupplierCowIntake: Number(allCow.toFixed(1)),
      allTimeSupplierBuffaloIntake: Number(allBuff.toFixed(1)),
    };
  }, [intakeLogs, targetActiveDate]);

  // Supplier procurement cost strictly for the active business day
  const supplierProcurementTotal = useMemo(() => {
    return (intakeLogs || []).reduce((sum, item) => {
      const dateStr = normalizeDateStr(item.date || item.createdAt);
      if (dateStr !== targetActiveDate) return sum;

      const qty = Number(item.quantity || item.quantityLiters) || 0;
      const explicit = Number(item.totalCost ?? item.totalAmount) || 0;
      const rate = Number(item.ratePerLiter ?? item.rate ?? item.pricePerLiter) || 0;
      return sum + (explicit > 0 ? explicit : qty * rate);
    }, 0);
  }, [intakeLogs, targetActiveDate]);

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

  activeSalesHistory.forEach((sale) => {
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
    const srcLow = rawSrc.toLowerCase();
    const isDahi = cat.includes('dahi') || name.includes('dahi') || cat.includes('yogurt') || name.includes('yogurt') || cat.includes('curd') || name.includes('curd');
    const isMilk = !isDahi && (cat.includes('milk') || name.includes('milk') || cat.includes('cow') || cat.includes('buffalo') || name.includes('cow') || name.includes('buffalo'));

    if (name.includes('supplier share') || srcLow === 'supplier') {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi, isMilk };
    }
    if (name.includes('farm share') || srcLow === 'farm') {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi, isMilk };
    }

    if (isDahi) {
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


  // Isolated Farm Sales (Complete historical archive across all orders)
  const farmSalesHistory = useMemo(() => {
    return (salesHistory || [])
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
              lineQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) : (item.farmDeducted !== undefined ? Number(item.farmDeducted) : totalItemQty);
            } else if (item.farmDahiRevenue !== undefined && Number(item.farmDahiRevenue) > 0) {
              lineRev = Number(item.farmDahiRevenue);
              lineQty = item.farmDeducted !== undefined ? Number(item.farmDeducted) : totalItemQty;
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

  // Isolated Supplier Sales (Complete historical archive across all orders)
  const supplierSalesHistory = useMemo(() => {
    return (salesHistory || [])
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
              lineQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) : (item.supplierDeducted !== undefined ? Number(item.supplierDeducted) : totalItemQty);
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
    const sDate = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
    if (sDate !== targetActiveDate) return;

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
    const sDate = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
    if (sDate !== targetActiveDate) return;
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

  // Live Expenses and Procurement Outflows strictly filtered for the active business day
  const activeFarmExpenses = (farmExpensesList || []).filter((e) => {
    if (!e) return false;
    const expDate = normalizeDateStr(e.date || e.createdAt);
    return expDate === targetActiveDate;
  });
  const activeSupplierExpenses = (supplierExpensesList || []).filter((e) => {
    if (!e) return false;
    const expDate = normalizeDateStr(e.date || e.createdAt);
    return expDate === targetActiveDate;
  });

  const farmExpensesTotal = activeFarmExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const supplierExpensesTotal = activeSupplierExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayExpenses = farmExpensesTotal + supplierExpensesTotal;
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
    farmRawMilkRevenue: farmStats.milkRevenue,
    dahiRevenue: farmStats.dahiRevenue,
    farmDahiRevenue: farmStats.dahiRevenue,
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
    todayExpenses: farmExpensesTotal,
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
    supplierRevenue: supplierTotalIncome,
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
    todayExpenses: supplierExpensesTotal,
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
    todayExpenses,
    farmRawMilkRevenue: farmStats.milkRevenue,
    farmDahiRevenue: farmStats.dahiRevenue,
    supplierRevenue: supplierTotalIncome,
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

  // Processing batch stock aggregations (both Active Day and All-Time)
  let farmMilkConvertedToDahi = 0;
  let farmCowConvertedToDahi = 0;
  let farmBuffConvertedToDahi = 0;
  let supplierMilkConvertedToDahi = 0;
  let supplierCowConvertedToDahi = 0;
  let supplierBuffConvertedToDahi = 0;

  let allTimeFarmMilkConvertedToDahi = 0;
  let allTimeFarmCowConvertedToDahi = 0;
  let allTimeFarmBuffConvertedToDahi = 0;
  let allTimeSupplierMilkConvertedToDahi = 0;
  let allTimeSupplierCowConvertedToDahi = 0;
  let allTimeSupplierBuffConvertedToDahi = 0;

  let totalDahiTransferredToPOS = 0;
  let totalFarmDahiTransferredToPOS = 0;
  let totalSupplierDahiTransferredToPOS = 0;

  let allTimeDahiTransferredToPOS = 0;
  let allTimeFarmDahiTransferredToPOS = 0;
  let allTimeSupplierDahiTransferredToPOS = 0;

  let totalDahiChilledInKitchen = 0;
  let totalFarmDahiChilledInKitchen = 0;
  let totalSupplierDahiChilledInKitchen = 0;
  let processedCowMilkStock = 0;
  let processedBuffaloMilkStock = 0;
  let totalProcessedMilk = 0;
  const batchProductStockMap = {};

  // Deduplicate batches to strictly avoid double counting/double deduction
  const seenBatchKeys = new Set();
  const dedupedBatches = [];
  (processingBatches || []).forEach((b) => {
    if (!b) return;
    const key = String(b.batchNumber || b._id || b.id || '').trim();
    if (key) {
      if (seenBatchKeys.has(key)) return;
      seenBatchKeys.add(key);
    }
    const fuzzyKey = `${normalizeDateStr(b.date || b.createdAt)}_${Number(b.milkUsedQuantity || b.milkUsedVal || b.milkUsedLiters || 0).toFixed(1)}_${Number(b.outputQuantity || b.outputVal || 0).toFixed(1)}`;
    if (seenBatchKeys.has(fuzzyKey)) return;
    seenBatchKeys.add(fuzzyKey);

    dedupedBatches.push(b);
  });

  dedupedBatches.forEach((b) => {
    const bDate = normalizeDateStr(b.date || b.createdAt);
    const isLogToday = bDate
      ? bDate === targetActiveDate
      : isTodayDate(b.createdAt || b.date, targetActiveDate);

    const pName = (b.product || '').toLowerCase();
    const isDahi = pName.includes('dahi') || pName.includes('yogurt') || pName.includes('curd');
    const isMilk = pName.includes('milk') && !isDahi;
    const isCow = pName.includes('cow');
    const isBuff = pName.includes('buffalo');

    const numUsed = Number(b.milkUsedQuantity || b.milkUsedVal || b.milkUsedLiters) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
    const outNum = Number(b.outputQuantity || b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;

    // 100% Dynamic proportional yield inputs:
    let farmMilkInput = 0;
    let supplierMilkInput = 0;

    if (b.farmMilkUsed !== undefined && b.supplierMilkUsed !== undefined) {
      farmMilkInput = Number(b.farmMilkUsed) || 0;
      supplierMilkInput = Number(b.supplierMilkUsed) || 0;
    } else {
      const src = (b.source || '').toLowerCase();
      if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix') && !src.includes('both')) {
        farmMilkInput = numUsed;
        supplierMilkInput = 0;
      } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix') && !src.includes('both')) {
        farmMilkInput = 0;
        supplierMilkInput = numUsed;
      } else {
        const totalSourced = totalFarmMilk + totalSupplierIntake;
        const ratio = totalSourced > 0 ? totalFarmMilk / totalSourced : 0.5;
        farmMilkInput = Math.round(numUsed * ratio);
        supplierMilkInput = Math.max(0, numUsed - farmMilkInput);
      }
    }

    const totalMilkUsed = farmMilkInput + supplierMilkInput > 0 ? (farmMilkInput + supplierMilkInput) : numUsed;
    let farmRatio = 0.5;
    let supplierRatio = 0.5;
    if (totalMilkUsed > 0) {
      farmRatio = farmMilkInput / totalMilkUsed;
      supplierRatio = supplierMilkInput / totalMilkUsed;
    } else if (b.farmRatio !== undefined && b.supplierRatio !== undefined) {
      farmRatio = Number(b.farmRatio) || 0.5;
      supplierRatio = Number(b.supplierRatio) || 0.5;
    }

    const farmDahiAdded = b.farmDahiAdded !== undefined ? Number(b.farmDahiAdded) : Number((outNum * farmRatio).toFixed(3));
    const supplierDahiAdded = b.supplierDahiAdded !== undefined ? Number(b.supplierDahiAdded) : Number((outNum * supplierRatio).toFixed(3));

    const bMilkType = String(b.milkType || '').toLowerCase();
    const isBatchCow = bMilkType.includes('cow') || pName.includes('cow');

    if (isDahi || (!isMilk && numUsed > 0)) {
      if (isBatchCow) {
        allTimeFarmCowConvertedToDahi += farmMilkInput;
        allTimeSupplierCowConvertedToDahi += supplierMilkInput;
        if (isLogToday) {
          farmCowConvertedToDahi += farmMilkInput;
          supplierCowConvertedToDahi += supplierMilkInput;
        }
      } else {
        allTimeFarmBuffConvertedToDahi += farmMilkInput;
        allTimeSupplierBuffConvertedToDahi += supplierMilkInput;
        if (isLogToday) {
          farmBuffConvertedToDahi += farmMilkInput;
          supplierBuffConvertedToDahi += supplierMilkInput;
        }
      }
      allTimeFarmMilkConvertedToDahi += farmMilkInput;
      allTimeSupplierMilkConvertedToDahi += supplierMilkInput;
      if (isLogToday) {
        farmMilkConvertedToDahi += farmMilkInput;
        supplierMilkConvertedToDahi += supplierMilkInput;
      }
    }

    const bStatus = String(b.status || '').toLowerCase();
    const bStage = String(b.stage || '').toLowerCase();
    const isSoldOut = bStage === 'sold_out' || bStatus === 'sold_out' || bStage === 'discarded' || bStatus === 'discarded';
    const isDahiProduced = isDahi && outNum > 0 && !isSoldOut;
    const isTransferredToPOS = bStage === 'pos' || bStatus === 'pos' || bStatus === 'ready_for_pos';
    const isChilledInKitchen = bStage === 'chilled' || (bStatus === 'completed' && !isTransferredToPOS);
    const isReadyMilk = isTransferredToPOS || ['completed', 'ready_for_pos'].includes(bStatus) || ['completed'].includes(bStage);

    if (outNum > 0) {
      // Map all active produced Dahi batches immediately to POS stock
      if (isDahiProduced) {
        allTimeDahiTransferredToPOS += outNum;
        allTimeFarmDahiTransferredToPOS += farmDahiAdded;
        allTimeSupplierDahiTransferredToPOS += supplierDahiAdded;

        if (isLogToday) {
          totalDahiTransferredToPOS += outNum;
          totalFarmDahiTransferredToPOS += farmDahiAdded;
          totalSupplierDahiTransferredToPOS += supplierDahiAdded;
        }

        if (isChilledInKitchen) {
          totalDahiChilledInKitchen += outNum;
          totalFarmDahiChilledInKitchen += farmDahiAdded;
          totalSupplierDahiChilledInKitchen += supplierDahiAdded;
        }

        const rawName = b.product || 'Fresh Dahi';
        batchProductStockMap[rawName] = (batchProductStockMap[rawName] || 0) + outNum;
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
    }
  });

  let todayFarmMilkSold = 0;
  let todayFarmCowMilkSold = 0;
  let todayFarmBuffaloMilkSold = 0;
  let todaySupplierMilkSold = 0;
  let todaySupplierCowMilkSold = 0;
  let todaySupplierBuffaloMilkSold = 0;
  let todayFarmDahiSold = 0;
  let todaySupplierDahiSold = 0;

  let allTimeFarmMilkSold = 0;
  let allTimeFarmCowMilkSold = 0;
  let allTimeFarmBuffaloMilkSold = 0;
  let allTimeSupplierMilkSold = 0;
  let allTimeSupplierCowMilkSold = 0;
  let allTimeSupplierBuffaloMilkSold = 0;
  let allTimeFarmDahiSold = 0;
  let allTimeSupplierDahiSold = 0;

  (salesHistory || []).forEach((sale) => {
    const sDate = normalizeDateStr(sale.date || sale.timestamp || sale.createdAt);
    const isToday = sDate === targetActiveDate;

    (sale.items || []).forEach((item) => {
      const { source: src } = resolveItemSourceAndRatios(item);
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const qty = Number(item.quantity) || 0;

      const isDahi = cat.includes('dahi') || name.includes('dahi') || cat.includes('yogurt') || name.includes('yogurt') || cat.includes('curd') || name.includes('curd');
      const isMilk = !isDahi && (cat.includes('milk') || name.includes('milk') || cat.includes('buffalo') || cat.includes('cow') || name.includes('buffalo') || name.includes('cow'));

      if (isMilk) {
        const isCow = item.milkType === 'cow' || name.includes('cow') || cat.includes('cow');
        let fQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) || 0 : (src === 'Farm' ? qty : 0);
        let sQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) || 0 : (src === 'Supplier' ? qty : 0);
        if (fQty === 0 && sQty === 0) {
          if (src === 'Supplier') sQty = qty;
          else fQty = qty;
        }

        allTimeFarmMilkSold += fQty;
        allTimeSupplierMilkSold += sQty;
        if (isCow) {
          allTimeFarmCowMilkSold += fQty;
          allTimeSupplierCowMilkSold += sQty;
        } else {
          allTimeFarmBuffaloMilkSold += fQty;
          allTimeSupplierBuffaloMilkSold += sQty;
        }

        if (isToday) {
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
      } else if (isDahi) {
        let fDahiQty = item.farmDeducted !== undefined
          ? Number(item.farmDeducted) || 0
          : (item.farmQuantity !== undefined ? Number(item.farmQuantity) || 0 : (src === 'Farm' ? qty : 0));
        let sDahiQty = item.supplierDeducted !== undefined
          ? Number(item.supplierDeducted) || 0
          : (item.supplierQuantity !== undefined ? Number(item.supplierQuantity) || 0 : (src === 'Supplier' ? qty : 0));
        if (fDahiQty === 0 && sDahiQty === 0) {
          if (src === 'Supplier') sDahiQty = qty;
          else fDahiQty = qty;
        }

        allTimeFarmDahiSold += fDahiQty;
        allTimeSupplierDahiSold += sDahiQty;

        if (isToday) {
          todayFarmDahiSold += fDahiQty;
          todaySupplierDahiSold += sDahiQty;
        }
      }
    });
  });

  let todaySupplierIntake = 0;
  let todaySupplierCowIntake = 0;
  let todaySupplierBuffaloIntake = 0;

  (intakeLogs || []).forEach((item) => {
    const isLogToday = normalizeDateStr(item.date || item.createdAt) === targetActiveDate;
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

  // Requirement 2 & 4: Inventory Carry-Over (Opening Stock carries forward, new intake dynamically adds)
  const openingFarmCow = Number(openingStock?.farmCowMilk || 0);
  const openingFarmBuff = Number(openingStock?.farmBuffaloMilk || 0);
  const openingSupCow = Number(openingStock?.supplierCowMilk || 0);
  const openingSupBuff = Number(openingStock?.supplierBuffaloMilk || 0);
  const openingFarmDahi = Number(openingStock?.farmDahi || 0);
  const openingSupDahi = Number(openingStock?.supplierDahi || 0);

  const hasOpeningStock = (
    openingFarmCow > 0 ||
    openingFarmBuff > 0 ||
    openingSupCow > 0 ||
    openingSupBuff > 0 ||
    openingFarmDahi > 0 ||
    openingSupDahi > 0
  );

  // Dynamic carry-forward + today's yield/intake - today's sales (strictly 0 if no intake/milking logged)
  const hasFarmCowEntry = openingFarmCow > 0 || totalFarmCowMilk > 0;
  const preDahiCow = hasFarmCowEntry
    ? (openingFarmCow + totalFarmCowMilk - todayFarmCowMilkSold) + processedCowMilkStock
    : 0;

  const hasFarmBuffEntry = openingFarmBuff > 0 || totalFarmBuffaloMilk > 0;
  const preDahiBuff = hasFarmBuffEntry
    ? (openingFarmBuff + totalFarmBuffaloMilk - todayFarmBuffaloMilkSold) + processedBuffaloMilkStock
    : 0;
  const activeFarmCowDahi = hasFarmCowEntry ? farmCowConvertedToDahi : 0;
  const activeFarmBuffDahi = hasFarmBuffEntry ? farmBuffConvertedToDahi : 0;

  const remainingFarmCowMilk = Math.max(0, Number((Math.max(0, preDahiCow) - activeFarmCowDahi).toFixed(1)));
  const remainingFarmBuffaloMilk = Math.max(0, Number((Math.max(0, preDahiBuff) - activeFarmBuffDahi).toFixed(1)));

  const hasSupCowEntry = openingSupCow > 0 || todaySupplierCowIntake > 0;
  const preDahiSupCow = hasSupCowEntry
    ? (openingSupCow + todaySupplierCowIntake - todaySupplierCowMilkSold)
    : 0;

  const hasSupBuffEntry = openingSupBuff > 0 || todaySupplierBuffaloIntake > 0;
  const preDahiSupBuff = hasSupBuffEntry
    ? (openingSupBuff + todaySupplierBuffaloIntake - todaySupplierBuffaloMilkSold)
    : 0;

  const activeSupCowDahi = hasSupCowEntry ? supplierCowConvertedToDahi : 0;
  const activeSupBuffDahi = hasSupBuffEntry ? supplierBuffConvertedToDahi : 0;

  const remainingSupplierCowMilk = Math.max(0, Number((Math.max(0, preDahiSupCow) - activeSupCowDahi).toFixed(1)));
  const remainingSupplierBuffaloMilk = Math.max(0, Number((Math.max(0, preDahiSupBuff) - activeSupBuffDahi).toFixed(1)));

  // Dynamic sums strictly derived from isolated stocks:
  const availableFarmStock = Number((remainingFarmCowMilk + remainingFarmBuffaloMilk).toFixed(1));
  const remainingFarmMilk = availableFarmStock;
  const remainingSupplierMilk = Number((remainingSupplierCowMilk + remainingSupplierBuffaloMilk).toFixed(1));
  const remainingTotalMilk = Number((remainingFarmCowMilk + remainingFarmBuffaloMilk + remainingSupplierCowMilk + remainingSupplierBuffaloMilk + totalProcessedMilk).toFixed(1));
  const totalFarmMilkSoldQty = todayFarmMilkSold;

  // 100% Dynamic Cascading Dahi Stocks with Opening Stock carry-forward
  let rawFarmDahiStock = 0;
  let rawSupplierDahiStock = 0;

  if (hasOpeningStock) {
    rawFarmDahiStock = Math.max(0, Number((openingFarmDahi + totalFarmDahiTransferredToPOS - todayFarmDahiSold).toFixed(2)));
    rawSupplierDahiStock = Math.max(0, Number((openingSupDahi + totalSupplierDahiTransferredToPOS - todaySupplierDahiSold).toFixed(2)));
  } else {
    rawFarmDahiStock = Math.max(0, Number((allTimeFarmDahiTransferredToPOS - allTimeFarmDahiSold).toFixed(2)));
    rawSupplierDahiStock = Math.max(0, Number((allTimeSupplierDahiTransferredToPOS - allTimeSupplierDahiSold).toFixed(2)));
  }

  if (rawFarmDahiStock === 0 && rawSupplierDahiStock === 0 && dahiProducts.length > 0) {
    dahiProducts.forEach((p) => {
      const pStock = Number(p.stock ?? p.currentStock) || 0;
      const pSrc = (p.source || '').toLowerCase();
      if (pSrc.includes('supplier')) {
        rawSupplierDahiStock += pStock;
      } else {
        rawFarmDahiStock += pStock;
      }
    });
  }

  const rawTotalDahiStock = Number((rawFarmDahiStock + rawSupplierDahiStock).toFixed(2));
  const availableDahiStock = rawTotalDahiStock;

  const dahiExtraMarginPerKg = Math.max(0, (Number(activeDahiPrice) || 0) - (Number(activeMilkPrice) || 0));
  const dahiRealizedExtraProfit = Math.round(totalDahiSold * dahiExtraMarginPerKg);
  const dahiTotalExtraProfit = Math.round(totalDahiTransferredToPOS * dahiExtraMarginPerKg);

  // Sync current closing stock back into DailyCloseContext and localStorage for persistence
  useEffect(() => {
    if (typeof updateClosingStock === 'function') {
      updateClosingStock({
        farm: availableFarmStock,
        farmCowMilk: remainingFarmCowMilk,
        farmBuffaloMilk: remainingFarmBuffaloMilk,
        supplier: remainingSupplierMilk,
        supplierCowMilk: remainingSupplierCowMilk,
        supplierBuffaloMilk: remainingSupplierBuffaloMilk,
        dahi: rawTotalDahiStock,
        farmDahi: rawFarmDahiStock,
        supplierDahi: rawSupplierDahiStock,
      });
    }

    if (typeof window !== 'undefined') {
      try {
        const stocks = {
          farmCowMilk: remainingFarmCowMilk,
          farmBuffaloMilk: remainingFarmBuffaloMilk,
          farmMilkStock: availableFarmStock,
          supplierCowMilk: remainingSupplierCowMilk,
          supplierBuffaloMilk: remainingSupplierBuffaloMilk,
          supplierMilkStock: remainingSupplierMilk,
          totalMilkStock: remainingTotalMilk,
          totalMilk: remainingTotalMilk,
          dahiStock: rawTotalDahiStock,
          farmDahiStock: rawFarmDahiStock,
          supplierDahiStock: rawSupplierDahiStock,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('pmb_inventory_stocks', JSON.stringify(stocks));
      } catch (_) {}
    }
  }, [
    availableFarmStock,
    remainingFarmCowMilk,
    remainingFarmBuffaloMilk,
    remainingSupplierMilk,
    remainingSupplierCowMilk,
    remainingSupplierBuffaloMilk,
    remainingTotalMilk,
    rawTotalDahiStock,
    rawFarmDahiStock,
    rawSupplierDahiStock,
    updateClosingStock,
  ]);

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
    // Dynamic Proportional Dahi Stocks formatted with .toFixed(2)
    farmDahiStock: rawFarmDahiStock.toFixed(2),
    supplierDahiStock: rawSupplierDahiStock.toFixed(2),
    totalDahi: rawTotalDahiStock.toFixed(2),
    totalDahiStock: rawTotalDahiStock.toFixed(2),
    totalDahiTransferred: totalDahiTransferredToPOS.toFixed(2),
    totalFarmDahiTransferred: totalFarmDahiTransferredToPOS.toFixed(2),
    totalSupplierDahiTransferred: totalSupplierDahiTransferredToPOS.toFixed(2),
    chilledDahiStock: totalDahiChilledInKitchen.toFixed(2),
    rawFarmMilkStock: availableFarmStock,
    rawFarmCowMilkStock: remainingFarmCowMilk,
    rawFarmBuffaloMilkStock: remainingFarmBuffaloMilk,
    rawSupplierMilkStock: remainingSupplierMilk,
    rawSupplierCowMilkStock: remainingSupplierCowMilk,
    rawSupplierBuffaloMilkStock: remainingSupplierBuffaloMilk,
    rawTotalMilkStock: remainingTotalMilk,
    rawFarmDahiStock,
    rawSupplierDahiStock,
    rawTotalDahiStock,
    rawDahiStock: rawTotalDahiStock,
    rawChilledDahiStock: totalDahiChilledInKitchen,
    totalFarmMilkIntake: totalFarmMilk,
    totalFarmMilkSold: todayFarmMilkSold,
    totalFarmMilkConvertedToDahi: farmMilkConvertedToDahi,
    milkSold: (totalMilkSold % 1 === 0 ? totalMilkSold.toFixed(0) : totalMilkSold.toFixed(2)),
    dahiSold: (totalDahiSold % 1 === 0 ? totalDahiSold.toFixed(0) : totalDahiSold.toFixed(2)),
    todayFarmDahiSold: Number(todayFarmDahiSold.toFixed(2)),
    todaySupplierDahiSold: Number(todaySupplierDahiSold.toFixed(2)),
    farmDahiSold: Number(farmStats.dahiSold.toFixed(2)),
    supplierDahiSold: Number(supplierStats.dahiSold.toFixed(2)),
    totalMilkPrice,
    totalDahiPrice,
    dahiExtraProfit: dahiRealizedExtraProfit,
    dahiTotalPotentialExtraProfit: dahiTotalExtraProfit,
    milkPrice: activeMilkPrice,
    dahiPrice: activeDahiPrice,
    productBatchStockMap: batchProductStockMap,
    openingStock: {
      farm: Number((openingFarmCow + openingFarmBuff).toFixed(1)),
      supplier: Number((openingSupCow + openingSupBuff).toFixed(1)),
      dahi: Number((openingFarmDahi + openingSupDahi).toFixed(2)),
      farmCowMilk: openingFarmCow,
      farmBuffaloMilk: openingFarmBuff,
      supplierCowMilk: openingSupCow,
      supplierBuffaloMilk: openingSupBuff,
      farmDahi: openingFarmDahi,
      supplierDahi: openingSupDahi,
    },
    closingStock: {
      farm: availableFarmStock,
      supplier: remainingSupplierMilk,
      dahi: rawTotalDahiStock,
      farmCowMilk: remainingFarmCowMilk,
      farmBuffaloMilk: remainingFarmBuffaloMilk,
      supplierCowMilk: remainingSupplierCowMilk,
      supplierBuffaloMilk: remainingSupplierBuffaloMilk,
      farmDahi: rawFarmDahiStock,
      supplierDahi: rawSupplierDahiStock,
    },
    isDayClosed,
    activeDate,
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
    openingStock,
    isDayClosed,
    activeDate,
  };
}
