import { useMemo } from 'react';

export function useSupplierPLMetrics({
  filteredIntakeLogs = [],
  filteredSales = [],
  filteredExpenses = [],
  supplierSalesMetrics,
}) {
  // Compute Supplier Milk and Dahi Sales strictly isolated from filtered sales
  const { supplierMilkSales, supplierMilkVolume, supplierDahiSales, supplierDahiVolume, totalSupplierSales } = useMemo(() => {
    let mSales = 0;
    let mVol = 0;
    let dSales = 0;
    let dVol = 0;

    filteredSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const iName = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price || item.unitPrice) || 0));

        const isDahi = iName.includes('dahi') || cat.includes('dahi') || iName.includes('yogurt') || cat.includes('yogurt');
        if (isDahi) {
          dSales += sub;
          dVol += qty;
        } else {
          mSales += sub;
          mVol += qty;
        }
      });
    });

    return {
      supplierMilkSales: mSales,
      supplierMilkVolume: mVol,
      supplierDahiSales: dSales,
      supplierDahiVolume: dVol,
      totalSupplierSales: mSales + dSales,
    };
  }, [filteredSales]);

  // Real Milk Procurement Streams Dynamically From Intake Records
  const productStreams = useMemo(() => {
    const buffaloLogs = [...filteredIntakeLogs];

    // Real Sourced Volumes (Liters) from IntakeContext
    const buffaloVolume = buffaloLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

    // Real Base Sourcing Costs (Rs.) from IntakeContext
    const buffaloCost = buffaloLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);

    // Real Payments & Pending Balances
    const buffaloPaid = buffaloLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const buffaloPending = buffaloLogs.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0);

    const buildIntakeChannels = (logs, totalVol, totalCostVal) => {
      const morningLogs = logs.filter((l) => (l.shift || '').toLowerCase().includes('morning') || (l.time || '').toLowerCase().includes('morning'));
      const eveningLogs = logs.filter((l) => (l.shift || '').toLowerCase().includes('evening') || (l.time || '').toLowerCase().includes('evening'));
      const otherLogs = logs.filter((l) => !morningLogs.includes(l) && !eveningLogs.includes(l));

      const mVol = morningLogs.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
      const mCost = morningLogs.reduce((s, l) => s + (Number(l.totalCost) || 0), 0);
      const eVol = eveningLogs.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
      const eCost = eveningLogs.reduce((s, l) => s + (Number(l.totalCost) || 0), 0);
      const oVol = otherLogs.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
      const oCost = otherLogs.reduce((s, l) => s + (Number(l.totalCost) || 0), 0);

      const ch = [];
      if (mVol > 0) {
        ch.push({
          channelName: 'Morning Intake Shift',
          channelSubtext: 'Early morning farmer collections',
          volume: mVol,
          cost: mCost,
          avgRate: mVol > 0 ? Math.round(mCost / mVol) : 0,
          sharePercent: totalVol > 0 ? Math.round((mVol / totalVol) * 100) : 0,
          revenue: Math.round(supplierMilkSales * (totalVol > 0 ? mVol / totalVol : 0)),
          grossMargin: Math.round(supplierMilkSales * (totalVol > 0 ? mVol / totalVol : 0)) - mCost,
        });
      }
      if (eVol > 0) {
        ch.push({
          channelName: 'Evening Intake Shift',
          channelSubtext: 'Late afternoon farmer collections',
          volume: eVol,
          cost: eCost,
          avgRate: eVol > 0 ? Math.round(eCost / eVol) : 0,
          sharePercent: totalVol > 0 ? Math.round((eVol / totalVol) * 100) : 0,
          revenue: Math.round(supplierMilkSales * (totalVol > 0 ? eVol / totalVol : 0)),
          grossMargin: Math.round(supplierMilkSales * (totalVol > 0 ? eVol / totalVol : 0)) - eCost,
        });
      }
      if (oVol > 0 || ch.length === 0) {
        ch.push({
          channelName: ch.length === 0 ? 'General Intake' : 'Special / Bulk Procurement',
          channelSubtext: 'Standard supplier deliveries',
          volume: oVol || totalVol,
          cost: oCost || totalCostVal,
          avgRate: (oVol || totalVol) > 0 ? Math.round((oCost || totalCostVal) / (oVol || totalVol)) : 0,
          sharePercent: totalVol > 0 ? Math.round(((oVol || totalVol) / totalVol) * 100) : 100,
          revenue: Math.round(supplierMilkSales * (totalVol > 0 ? (oVol || totalVol) / totalVol : 1)),
          grossMargin: Math.round(supplierMilkSales * (totalVol > 0 ? (oVol || totalVol) / totalVol : 1)) - (oCost || totalCostVal),
        });
      }
      return ch;
    };

    const streams = [
      {
        id: 'LINE-BUF-SUP',
        streamName: 'Supplier Sourced Buffalo Milk',
        category: 'Pure Raw Fresh Milk',
        sourceType: 'External Supplier Gate',
        originDetails: 'Third-party dairy farmers & local vendors',
        sourcedVolume: buffaloVolume,
        unit: 'L',
        baseCost: buffaloCost,
        paidAmount: buffaloPaid,
        pendingAmount: buffaloPending,
        avgPurchaseRate: buffaloVolume > 0 ? Math.round(buffaloCost / buffaloVolume) : 0,
        resaleRevenue: supplierMilkSales,
        soldVolume: supplierMilkVolume,
        avgResaleRate: supplierMilkVolume > 0 ? Math.round(supplierMilkSales / supplierMilkVolume) : 210,
        grossMargin: supplierMilkSales - buffaloCost,
        grossMarginPercent: supplierMilkSales > 0 ? Math.round(((supplierMilkSales - buffaloCost) / supplierMilkSales) * 100) : 0,
        allocatedOverhead: 0,
        netProfit: supplierMilkSales - buffaloCost,
        realizationPerUnit: buffaloVolume > 0 ? Math.round((supplierMilkSales - buffaloCost) / buffaloVolume) : 0,
        channels: buildIntakeChannels(buffaloLogs, buffaloVolume, buffaloCost),
        logsCount: buffaloLogs.length,
      },
    ];

    if (supplierDahiSales > 0 || supplierDahiVolume > 0) {
      streams.push({
        id: 'LINE-DAHI-SUP',
        streamName: 'Supplier & Mixed Dahi (Supplier Share)',
        category: 'Processed & Chilled',
        sourceType: 'Dahi Value Addition',
        originDetails: 'Supplier-Sourced & Mixed Batch Dahi Conversion',
        sourcedVolume: supplierDahiVolume,
        unit: 'kg',
        baseCost: 0,
        paidAmount: 0,
        pendingAmount: 0,
        avgPurchaseRate: 0,
        resaleRevenue: supplierDahiSales,
        soldVolume: supplierDahiVolume,
        avgResaleRate: supplierDahiVolume > 0 ? Math.round(supplierDahiSales / supplierDahiVolume) : 320,
        grossMargin: supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0),
        grossMarginPercent: supplierDahiSales > 0 ? Math.round(((supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0)) / supplierDahiSales) * 100) : 0,
        allocatedOverhead: 0,
        netProfit: supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0),
        realizationPerUnit: supplierDahiVolume > 0 ? Math.round((supplierDahiSales - (supplierSalesMetrics?.dahiProductionCost || 0)) / supplierDahiVolume) : 0,
        channels: [
          {
            channelName: 'POS Counter & Delivery Dahi Sales',
            channelSubtext: 'Supplier portion of Dahi sales',
            volume: supplierDahiVolume,
            cost: 0,
            avgRate: 0,
            sharePercent: 100,
            revenue: supplierDahiSales,
            grossMargin: supplierDahiSales,
          },
        ],
        logsCount: 1,
      });
    }

    return streams;
  }, [filteredIntakeLogs, supplierMilkSales, supplierMilkVolume, supplierDahiSales, supplierDahiVolume, supplierSalesMetrics]);

  // Aggregate Summary Data for the Cards
  const summaryData = useMemo(() => {
    const totalVolume = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    const totalSupplierCost = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
    const totalPaid = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const totalPending = filteredIntakeLogs.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0);
    const totalRealizedSales = totalSupplierSales;
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const supplierNetProfit = totalSupplierSales - totalSupplierCost - totalExpenses;
    const totalGross = totalSupplierSales - totalSupplierCost;

    const avgPurchaseRate = totalVolume > 0 ? totalSupplierCost / totalVolume : 0;
    const avgResalePerLiter = supplierMilkVolume > 0 ? supplierMilkSales / supplierMilkVolume : 0;
    const grossMarginPercent = totalRealizedSales > 0 ? Math.round((totalGross / totalRealizedSales) * 100) : 0;

    return {
      income: totalRealizedSales,
      cost: totalSupplierCost,
      gross: totalGross,
      logistics: totalExpenses,
      net: supplierNetProfit,
      realizationPerLiter: avgPurchaseRate,
      totalVolume,
      buffaloVolume: totalVolume,
      avgPurchaseRate,
      avgResalePerLiter,
      overheadPerLiter: totalVolume > 0 ? totalExpenses / totalVolume : 0,
      grossMarginPercent,
      netMarginPercent: totalRealizedSales > 0 ? Math.round((supplierNetProfit / totalRealizedSales) * 100) : 0,
      paidSpend: totalPaid,
      pendingSpend: totalPending,
      realSoldVolume: supplierMilkVolume,
      dahiSoldVolume: supplierDahiVolume,
      milkSales: supplierMilkSales,
      dahiSales: supplierDahiSales,
      products: productStreams,
      intakeRecords: filteredIntakeLogs,
      expenses: filteredExpenses,
      expenseVouchersCount: filteredExpenses.length,
    };
  }, [productStreams, filteredIntakeLogs, filteredExpenses, totalSupplierSales, supplierMilkSales, supplierDahiSales, supplierMilkVolume, supplierDahiVolume]);

  // Data for Bar Chart ('Procurement Cost & Volume by Stream')
  const barChartData = useMemo(() => {
    return productStreams.map((p) => ({
      name: p.streamName.replace('Sourced ', '').replace('Standardized ', ''),
      fullName: p.streamName,
      baseCost: p.baseCost,
      sourcedVolume: p.sourcedVolume,
      resaleRevenue: p.resaleRevenue,
      grossMargin: p.grossMargin,
    }));
  }, [productStreams]);

  // Data for Donut Chart ('Sales Revenue Allocation')
  const donutChartData = useMemo(() => {
    return productStreams
      .filter((p) => p.resaleRevenue > 0)
      .map((p) => ({
        name: p.streamName,
        value: p.resaleRevenue,
      }));
  }, [productStreams]);

  return {
    supplierMilkSales,
    supplierMilkVolume,
    supplierDahiSales,
    supplierDahiVolume,
    totalSupplierSales,
    productStreams,
    summaryData,
    barChartData,
    donutChartData,
  };
}
