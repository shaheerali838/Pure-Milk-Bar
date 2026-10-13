import { useMemo } from 'react';
import { getPktTodayString } from '@/utils/dateUtils';

export const EXPENSE_CATEGORY_COLORS = {
  Feed: '#009966',
  Seed: '#0284c7',
  Veterinary: '#8b5cf6',
  Labor: '#f59e0b',
  Energy: '#f43f5e',
  Maintenance: '#64748b',
  Other: '#d97706',
};

const normalizeDate = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
  return '';
};

/**
 * Custom hook to filter financial streams and calculate farm P&L metrics
 */
export function useFarmPLMetrics({
  farmSalesHistory = [],
  expenses = [],
  salaryPayments = [],
  milkingLogs = [],
  dateFilterMode = 'today',
  selectedDate = '',
  startDate = '',
  endDate = '',
}) {
  const todayLocal = useMemo(() => {
    try {
      return getPktTodayString();
    } catch {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
  }, []);
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthISO = useMemo(() => (todayLocal || todayISO).slice(0, 7), [todayLocal, todayISO]);
  const previousMonthISO = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }, []);
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 35);
    return d.toISOString().split('T')[0];
  }, []);

  const isMatchToday = (dateStr) => {
    if (!dateStr) return false;
    const clean = String(dateStr).trim().slice(0, 10);
    return clean === todayLocal || clean === todayISO;
  };

  const { mondayISO, sundayISO } = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMonday);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { mondayISO: fmt(mon), sundayISO: fmt(sun) };
  }, []);

  const isMatchThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const clean = String(dateStr).trim().slice(0, 10);
    return clean >= mondayISO && clean <= sundayISO;
  };

  const isDateInMonthlyCycle = (dateStr) => {
    if (!dateStr) return true;
    const str = String(dateStr).trim();
    const cleanDate = str.length >= 10 ? str.slice(0, 10) : str;

    if (cleanDate.startsWith(currentMonthISO)) return true;
    if (cleanDate >= thirtyDaysAgo && cleanDate <= todayISO) return true;
    if (cleanDate.startsWith(previousMonthISO)) return true;

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const pISO = parsed.toISOString().split('T')[0];
      if (pISO.startsWith(currentMonthISO) || pISO.startsWith(previousMonthISO) || (pISO >= thirtyDaysAgo && pISO <= todayISO)) {
        return true;
      }
    }
    return false;
  };

  const matchesDate = (rawDate) => {
    const dateStr = normalizeDate(rawDate);
    if (!dateStr) return false;
    if (dateFilterMode === 'today') return isMatchToday(dateStr);
    if (dateFilterMode === 'this_week') return isMatchThisWeek(dateStr);
    if (dateFilterMode === 'this_month') return isDateInMonthlyCycle(dateStr);
    if (dateFilterMode === 'custom') {
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      if (selectedDate && !startDate && !endDate) return dateStr === selectedDate;
      return true;
    }
    return true; // 'all'
  };

  const filteredSales = useMemo(() => {
    return farmSalesHistory.filter((sale) => {
      const raw = sale.date || sale.timestamp || sale.createdAt || sale.formattedDate || '';
      return matchesDate(raw);
    });
  }, [farmSalesHistory, dateFilterMode, selectedDate, startDate, endDate, todayLocal, todayISO, currentMonthISO, previousMonthISO, thirtyDaysAgo, mondayISO, sundayISO]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const scope = String(exp.scope || exp.expenseEntity || 'FARM').toUpperCase();
      if (scope !== 'FARM') return false;
      return matchesDate(exp.date || exp.createdAt);
    });
  }, [expenses, dateFilterMode, selectedDate, startDate, endDate, todayLocal, todayISO, currentMonthISO, previousMonthISO, thirtyDaysAgo, mondayISO, sundayISO]);

  const filteredSalaries = useMemo(() => {
    return salaryPayments.filter((sal) => {
      return matchesDate(sal.date || sal.createdAt || sal.paymentDate);
    });
  }, [salaryPayments, dateFilterMode, selectedDate, startDate, endDate, todayLocal, todayISO, currentMonthISO, previousMonthISO, thirtyDaysAgo, mondayISO, sundayISO]);

  const filteredMilkingLogs = useMemo(() => {
    return (milkingLogs || []).filter((l) => {
      return matchesDate(l.date || l.createdAt);
    });
  }, [milkingLogs, dateFilterMode, selectedDate, startDate, endDate, todayLocal, todayISO, currentMonthISO, previousMonthISO, thirtyDaysAgo, mondayISO, sundayISO]);

  const totalStaffSalaryPaidInPeriod = useMemo(() => {
    return filteredSalaries.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredSalaries]);

  const calculatedMetrics = useMemo(() => {
    let rawMilkRevenue = 0;
    let rawMilkVolume = 0;
    let rawMilkCogs = 0;
    const milkItems = [];

    let cowMilkRevenue = 0;
    let cowMilkVolume = 0;
    const cowTransactions = [];

    let buffMilkRevenue = 0;
    let buffMilkVolume = 0;
    const buffTransactions = [];

    let valueAddedRevenue = 0;
    let valueAddedPackagingCost = 0;
    const valueAddedMap = {};

    let dahiRevenue = 0;
    let dahiVolume = 0;
    const dahiTransactions = [];

    let doorstepRevenue = 0;
    let doorstepCount = 0;
    let doorstepVolume = 0;

    let posRevenue = 0;
    let posCount = 0;
    let posVolume = 0;

    let wholesaleRevenue = 0;
    let wholesaleCount = 0;
    let wholesaleVolume = 0;

    const prodChannels = {
      cow: { doorstep: { volume: 0, revenue: 0 }, pos: { volume: 0, revenue: 0 }, wholesale: { volume: 0, revenue: 0 } },
      buff: { doorstep: { volume: 0, revenue: 0 }, pos: { volume: 0, revenue: 0 }, wholesale: { volume: 0, revenue: 0 } },
      dahi: { doorstep: { volume: 0, revenue: 0 }, pos: { volume: 0, revenue: 0 }, wholesale: { volume: 0, revenue: 0 } },
    };

    filteredSales.forEach((sale) => {
      const saleNet = Number(sale.netPayable || sale.subtotal) || 0;
      const isDelivery =
        sale.saleCategory === 'delivery' ||
        sale.fulfillmentMode === 'doorstep' ||
        (sale.channel && sale.channel.toLowerCase().includes('delivery'));
      const isWalkin =
        sale.saleCategory === 'walkin' ||
        sale.fulfillmentMode === 'counter' ||
        (sale.channel && sale.channel.toLowerCase().includes('pos'));
      const isWholesale =
        sale.saleCategory === 'wholesale' ||
        (sale.items || []).some((i) => (Number(i.quantity) || 0) >= 20) ||
        (sale.channel && sale.channel.toLowerCase().includes('wholesale'));

      const chKey = isDelivery ? 'doorstep' : (isWholesale ? 'wholesale' : 'pos');

      if (isDelivery) {
        doorstepRevenue += saleNet;
        doorstepCount += 1;
      } else if (isWholesale) {
        wholesaleRevenue += saleNet;
        wholesaleCount += 1;
      } else {
        posRevenue += saleNet;
        posCount += 1;
      }

      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.price) || 0;
        const lineTotal = Number(item.subtotal) || (qty * rate);
        const itemCost = Number(item.cost) || 0;

        const channelTag = isDelivery ? 'Doorstep Delivery' : (isWholesale ? 'Bulk Wholesale' : 'POS & Farm Gate');

        if (cat.includes('milk') || name.includes('milk') || name.includes('doodh')) {
          rawMilkRevenue += lineTotal;
          rawMilkVolume += qty;
          rawMilkCogs += itemCost > 0 ? (qty * itemCost) : (qty * 140);

          if (isDelivery) doorstepVolume += qty;
          else if (isWholesale) wholesaleVolume += qty;
          else posVolume += qty;

          milkItems.push({
            name: item.name,
            quantity: qty,
            unit: item.unit || 'L',
            price: rate,
            subtotal: lineTotal,
            channel: channelTag,
            date: sale.formattedDate || sale.date,
          });

          if (name.includes('cow')) {
            cowMilkRevenue += lineTotal;
            cowMilkVolume += qty;
            prodChannels.cow[chKey].volume += qty;
            prodChannels.cow[chKey].revenue += lineTotal;
            cowTransactions.push({ qty, rate, subtotal: lineTotal, channel: channelTag, date: sale.formattedDate || sale.date });
          } else if (name.includes('buffalo')) {
            buffMilkRevenue += lineTotal;
            buffMilkVolume += qty;
            prodChannels.buff[chKey].volume += qty;
            prodChannels.buff[chKey].revenue += lineTotal;
            buffTransactions.push({ qty, rate, subtotal: lineTotal, channel: channelTag, date: sale.formattedDate || sale.date });
          } else {
            const cowShareVol = Number((qty * 0.55).toFixed(1));
            const buffShareVol = Number((qty * 0.45).toFixed(1));
            const cowShareRev = Math.round(lineTotal * 0.55);
            const buffShareRev = lineTotal - cowShareRev;

            cowMilkRevenue += cowShareRev;
            cowMilkVolume += cowShareVol;
            prodChannels.cow[chKey].volume += cowShareVol;
            prodChannels.cow[chKey].revenue += cowShareRev;

            buffMilkRevenue += buffShareRev;
            buffMilkVolume += buffShareVol;
            prodChannels.buff[chKey].volume += buffShareVol;
            prodChannels.buff[chKey].revenue += buffShareRev;
          }
        } else {
          valueAddedRevenue += lineTotal;
          const pkgCost = itemCost > 0 ? (qty * itemCost) : (lineTotal * 0.12);
          valueAddedPackagingCost += pkgCost;

          const prodKey = item.name || 'Farm-Set Dahi';
          if (!valueAddedMap[prodKey]) {
            valueAddedMap[prodKey] = {
              name: prodKey,
              category: item.category || 'Value-Added',
              quantity: 0,
              unit: item.unit || 'units',
              revenue: 0,
              packagingCost: 0,
            };
          }
          valueAddedMap[prodKey].quantity += qty;
          valueAddedMap[prodKey].revenue += lineTotal;
          valueAddedMap[prodKey].packagingCost += pkgCost;

          if (name.includes('dahi') || cat.includes('dahi') || (!name.includes('milk') && !cat.includes('milk'))) {
            dahiRevenue += lineTotal;
            dahiVolume += qty;
            prodChannels.dahi[chKey].volume += qty;
            prodChannels.dahi[chKey].revenue += lineTotal;
            dahiTransactions.push({ qty, rate, subtotal: lineTotal, channel: channelTag, date: sale.formattedDate || sale.date });
          }
        }
      });
    });

    const grossRevenue = filteredSales.reduce((sum, s) => sum + (Number(s.netPayable || s.subtotal) || 0), 0);
    const doorstepShare = grossRevenue > 0 ? Math.round((doorstepRevenue / grossRevenue) * 100) : 0;
    const posShare = grossRevenue > 0 ? Math.round((posRevenue / grossRevenue) * 100) : 0;
    const wholesaleShare = grossRevenue > 0 ? Math.max(0, 100 - doorstepShare - posShare) : 0;

    // Direct Farm Production base from filtered milking logs
    const cowMilkingYield = filteredMilkingLogs
      .filter((l) => {
        const tag = (l.animalTag || l.tag || l.animalId?.tagNumber || l.animalId?.tag || '').toUpperCase();
        return tag.startsWith('COW') || (l.animalId?.type || '').toUpperCase() === 'COW';
      })
      .reduce((s, l) => s + (parseFloat(l.yieldLiters || l.yield || l.quantityLiters) || 0), 0);

    const buffMilkingYield = filteredMilkingLogs
      .filter((l) => {
        const tag = (l.animalTag || l.tag || l.animalId?.tagNumber || l.animalId?.tag || '').toUpperCase();
        return !tag.startsWith('COW') && (l.animalId?.type || '').toUpperCase() !== 'COW';
      })
      .reduce((s, l) => s + (parseFloat(l.yieldLiters || l.yield || l.quantityLiters) || 0), 0);

    const farmYieldDaily = cowMilkingYield + buffMilkingYield;

    const calcSplit = (chObj, totalRev) => {
      const dRev = chObj.doorstep.revenue;
      const pRev = chObj.pos.revenue;
      const wRev = chObj.wholesale.revenue;
      const tRev = totalRev > 0 ? totalRev : (dRev + pRev + wRev || 1);
      return {
        doorstep: { volume: chObj.doorstep.volume, revenue: dRev, share: Math.round((dRev / tRev) * 100) },
        pos: { volume: chObj.pos.volume, revenue: pRev, share: Math.round((pRev / tRev) * 100) },
        wholesale: { volume: chObj.wholesale.volume, revenue: wRev, share: Math.max(0, 100 - Math.round((dRev / tRev) * 100) - Math.round((pRev / tRev) * 100)) },
      };
    };

    const farmProductsTableData = [
      {
        id: 'cow_milk',
        name: 'Fresh Pure Cow Milk',
        category: 'Raw Milk',
        unit: 'L',
        totalOutput: cowMilkVolume > 0 ? cowMilkVolume : cowMilkingYield,
        sellingRate: cowMilkVolume > 0 ? Math.round(cowMilkRevenue / cowMilkVolume) : 0,
        grossRealized: cowMilkRevenue,
        directCost: 0,
        netProfit: cowMilkRevenue,
        netMargin: '100.0',
        channelSplit: calcSplit(prodChannels.cow, cowMilkRevenue),
        recentTransactions: cowTransactions,
      },
      {
        id: 'buffalo_milk',
        name: 'Fresh Rich Buffalo Milk',
        category: 'Raw Milk',
        unit: 'L',
        totalOutput: buffMilkVolume > 0 ? buffMilkVolume : buffMilkingYield,
        sellingRate: buffMilkVolume > 0 ? Math.round(buffMilkRevenue / buffMilkVolume) : 0,
        grossRealized: buffMilkRevenue,
        directCost: 0,
        netProfit: buffMilkRevenue,
        netMargin: '100.0',
        channelSplit: calcSplit(prodChannels.buff, buffMilkRevenue),
        recentTransactions: buffTransactions,
      },
      {
        id: 'farm_dahi',
        name: 'Farm-Set Dahi',
        category: 'Value-Added',
        unit: 'kg',
        totalOutput: dahiVolume,
        sellingRate: dahiVolume > 0 ? Math.round(dahiRevenue / dahiVolume) : 0,
        grossRealized: dahiRevenue,
        directCost: 0,
        netProfit: dahiRevenue,
        netMargin: '100.0',
        channelSplit: calcSplit(prodChannels.dahi, dahiRevenue),
        recentTransactions: dahiTransactions,
      },
    ];

    let totalFarmCost = 0;
    let charaFodderCost = 0;
    let wandaSilageCost = 0;
    let vetCost = 0;
    let laborCost = 0;
    let electricityCost = 0;
    let maintenanceCost = 0;
    let transportCost = 0;

    const catAmounts = {
      'Cattle Feed & Fodder': 0,
      'Concentrates & Seeds': 0,
      'Veterinary & Medicine': 0,
      'Labor & Wages': 0,
      'Energy & Utilities': 0,
      'Machinery Maintenance & Repairs': 0,
      'Transport & Other': 0,
    };

    filteredExpenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      const c = (exp.category || '').toLowerCase();
      const desc = (exp.description || '').toLowerCase();

      const isSalaryRecord = c.includes('salar') || c.includes('wage');
      if (!isSalaryRecord) {
        totalFarmCost += amt;
      }

      if (c.includes('feed') || c.includes('fodder') || c.includes('silage') || c.includes('wanda') || c.includes('chara') || c.includes('toori') || c.includes('khal')) {
        catAmounts['Cattle Feed & Fodder'] += amt;
        if (desc.includes('silage') || desc.includes('wanda') || desc.includes('khal')) {
          wandaSilageCost += amt;
        } else {
          charaFodderCost += amt;
        }
      } else if (c.includes('seed') || c.includes('concentrate') || c.includes('crop') || c.includes('fertilizer')) {
        catAmounts['Concentrates & Seeds'] += amt;
        wandaSilageCost += amt;
      } else if (c.includes('veterinary') || c.includes('medicine') || c.includes('doctor') || c.includes('ai')) {
        catAmounts['Veterinary & Medicine'] += amt;
        vetCost += amt;
      } else if (isSalaryRecord || c.includes('labor') || c.includes('labour') || c.includes('mess')) {
        if (!isSalaryRecord) {
          catAmounts['Labor & Wages'] += amt;
          laborCost += amt;
        }
      } else if (c.includes('electricity') || c.includes('utilities') || c.includes('energy') || c.includes('power')) {
        catAmounts['Energy & Utilities'] += amt;
        electricityCost += amt;
      } else if (c.includes('repair') || c.includes('machinery') || c.includes('maintenance') || c.includes('shed') || c.includes('hardware')) {
        catAmounts['Machinery Maintenance & Repairs'] += amt;
        maintenanceCost += amt;
      } else {
        catAmounts['Transport & Other'] += amt;
        transportCost += amt;
      }
    });

    catAmounts['Labor & Wages'] += totalStaffSalaryPaidInPeriod;
    laborCost += totalStaffSalaryPaidInPeriod;
    totalFarmCost += totalStaffSalaryPaidInPeriod;

    if (charaFodderCost === 0 && wandaSilageCost > 0) {
      charaFodderCost = Math.round(wandaSilageCost * 0.55);
      wandaSilageCost = wandaSilageCost - charaFodderCost;
    } else if (wandaSilageCost === 0 && charaFodderCost > 0) {
      wandaSilageCost = Math.round(charaFodderCost * 0.45);
      charaFodderCost = charaFodderCost - wandaSilageCost;
    }

    const categoryBreakdown = Object.keys(catAmounts).map((name) => {
      const amount = catAmounts[name];
      const percentage = totalFarmCost > 0 ? ((amount / totalFarmCost) * 100).toFixed(1) : 0;
      return {
        name,
        amount,
        percentage,
        color:
          name.includes('Feed') ? EXPENSE_CATEGORY_COLORS.Feed
          : name.includes('Seeds') ? EXPENSE_CATEGORY_COLORS.Seed
          : name.includes('Veterinary') ? EXPENSE_CATEGORY_COLORS.Veterinary
          : name.includes('Labor') ? EXPENSE_CATEGORY_COLORS.Labor
          : name.includes('Energy') ? EXPENSE_CATEGORY_COLORS.Energy
          : name.includes('Machinery') ? EXPENSE_CATEGORY_COLORS.Maintenance
          : EXPENSE_CATEGORY_COLORS.Other,
      };
    }).filter((c) => c.amount > 0);

    const netProfit = grossRevenue - totalFarmCost;
    const netMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;
    const totalVolume = rawMilkVolume > 0 ? rawMilkVolume : (farmYieldDaily > 0 ? farmYieldDaily : 1);
    const profitPerLiter = totalVolume > 0 ? (netProfit / totalVolume).toFixed(2) : 0;

    const productsList = Object.values(valueAddedMap).map((prod) => {
      const netGain = prod.revenue - prod.packagingCost;
      const margin = prod.revenue > 0 ? ((netGain / prod.revenue) * 100).toFixed(1) : 0;
      return { ...prod, netGain, margin };
    });

    const valueAddedMarginGain = valueAddedRevenue - valueAddedPackagingCost;
    const valueAddedMarginPercent = valueAddedRevenue > 0
      ? ((valueAddedMarginGain / valueAddedRevenue) * 100).toFixed(1)
      : 0;

    const rawMilkMargin = rawMilkRevenue > 0
      ? (((rawMilkRevenue - rawMilkCogs) / rawMilkRevenue) * 100).toFixed(1)
      : 0;
    const rawMilkShare = grossRevenue > 0 ? Math.round((rawMilkRevenue / grossRevenue) * 100) : 0;

    return {
      rawMilkRevenue,
      rawMilkVolume,
      rawMilkCogs,
      rawMilkMargin,
      rawMilkShare,
      milkItems,
      valueAddedRevenue,
      valueAddedPackagingCost,
      valueAddedMarginGain,
      valueAddedMarginPercent,
      valueAddedCount: productsList.length,
      productsList,
      grossRevenue,
      doorstepRevenue,
      doorstepCount,
      doorstepShare,
      doorstepVolume,
      posRevenue,
      posCount,
      posShare,
      posVolume,
      wholesaleRevenue,
      wholesaleCount,
      wholesaleShare,
      wholesaleVolume,
      totalFarmCost,
      totalStaffSalaryPaid: totalStaffSalaryPaidInPeriod,
      salaryPaymentsCount: filteredSalaries.length,
      expensesCount: filteredExpenses.length,
      categoryBreakdown,
      netProfit,
      netMargin,
      profitPerLiter,
      totalVolume,
      farmProductsTableData,
      charaFodderCost,
      wandaSilageCost,
      vetCost,
      laborCost,
      electricityCost,
      maintenanceCost,
      transportCost,
    };
  }, [filteredSales, filteredExpenses, filteredSalaries, filteredMilkingLogs, totalStaffSalaryPaidInPeriod]);

  return {
    filteredSales,
    filteredExpenses,
    filteredSalaries,
    filteredMilkingLogs,
    totalStaffSalaryPaidInPeriod,
    calculatedMetrics,
    todayLocal,
    todayISO,
  };
}
