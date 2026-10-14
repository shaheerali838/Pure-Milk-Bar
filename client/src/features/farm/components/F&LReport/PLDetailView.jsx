import React from 'react';
import ProductDetailSlideOver from './ProductDetailSlideOver';
import RawMilkDetail from './RawMilkDetail';
import ValueAddedDetail from './ValueAddedDetail';
import GrossRevenueDetail from './GrossRevenueDetail';
import FarmCostsDetail from './FarmCostsDetail';
import StaffSalaryDetail from './StaffSalaryDetail';
import NetProfitDetail from './NetProfitDetail';

/**
 * Dedicated Full Page / Drawer Detail View orchestrator for Farm P&L
 */
export default function PLDetailView({
  selectedProduct,
  onClearProduct,
  activeCardDrawer,
  onClearDrawer,
  calculatedMetrics,
  filteredSales = [],
  filteredExpenses = [],
  filteredSalaries = [],
  onDeleteSalaryPayment,
}) {
  if (selectedProduct) {
    return (
      <ProductDetailSlideOver
        product={selectedProduct}
        onBack={onClearProduct}
      />
    );
  }

  if (activeCardDrawer === 'raw_milk') {
    return (
      <RawMilkDetail
        data={{
          rawMilkVolume: calculatedMetrics.rawMilkVolume,
          rawMilkRevenue: calculatedMetrics.rawMilkRevenue,
          rawMilkCogs: calculatedMetrics.rawMilkCogs,
          rawMilkMargin: calculatedMetrics.rawMilkMargin,
          channelBreakdown: {
            doorstep: {
              volume: calculatedMetrics.doorstepVolume,
              revenue: calculatedMetrics.doorstepRevenue,
              share: calculatedMetrics.rawMilkRevenue > 0
                ? Math.round((calculatedMetrics.doorstepRevenue / calculatedMetrics.rawMilkRevenue) * 100)
                : 0,
            },
            pos: {
              volume: calculatedMetrics.posVolume,
              revenue: calculatedMetrics.posRevenue,
              share: calculatedMetrics.rawMilkRevenue > 0
                ? Math.round((calculatedMetrics.posRevenue / calculatedMetrics.rawMilkRevenue) * 100)
                : 0,
            },
            wholesale: {
              volume: calculatedMetrics.wholesaleVolume,
              revenue: calculatedMetrics.wholesaleRevenue,
              share: calculatedMetrics.rawMilkRevenue > 0
                ? Math.round((calculatedMetrics.wholesaleRevenue / calculatedMetrics.rawMilkRevenue) * 100)
                : 0,
            },
          },
          milkItems: calculatedMetrics.milkItems,
        }}
        onBack={onClearDrawer}
      />
    );
  }

  if (activeCardDrawer === 'value_added') {
    return (
      <ValueAddedDetail
        data={{
          valueAddedRevenue: calculatedMetrics.valueAddedRevenue,
          packagingCost: calculatedMetrics.valueAddedPackagingCost,
          netMarginGain: calculatedMetrics.valueAddedMarginGain,
          netMarginPercent: calculatedMetrics.valueAddedMarginPercent,
          productsList: calculatedMetrics.productsList,
        }}
        onBack={onClearDrawer}
      />
    );
  }

  if (activeCardDrawer === 'gross_revenue') {
    return (
      <GrossRevenueDetail
        data={{
          grossRevenue: calculatedMetrics.grossRevenue,
          doorstepRevenue: calculatedMetrics.doorstepRevenue,
          doorstepShare: calculatedMetrics.doorstepShare,
          doorstepCount: calculatedMetrics.doorstepCount,
          posRevenue: calculatedMetrics.posRevenue,
          posShare: calculatedMetrics.posShare,
          posCount: calculatedMetrics.posCount,
          wholesaleRevenue: calculatedMetrics.wholesaleRevenue,
          wholesaleShare: calculatedMetrics.wholesaleShare,
          wholesaleCount: calculatedMetrics.wholesaleCount,
          rawMilkRevenue: calculatedMetrics.rawMilkRevenue,
          valueAddedRevenue: calculatedMetrics.valueAddedRevenue,
          recentSales: filteredSales.map((s) => ({
            invoiceId: s.invoiceId,
            channel: s.saleCategory || s.fulfillmentMode,
            itemsSummary: (s.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', '),
            itemCount: s.itemCount || (s.items || []).length,
            netPayable: s.netPayable || s.subtotal,
            formattedDate: s.formattedDate || s.date,
          })),
        }}
        onBack={onClearDrawer}
      />
    );
  }

  if (activeCardDrawer === 'farm_costs') {
    return (
      <FarmCostsDetail
        data={{
          totalFarmCost: calculatedMetrics.totalFarmCost,
          categoryBreakdown: calculatedMetrics.categoryBreakdown,
          expenseList: filteredExpenses,
        }}
        onBack={onClearDrawer}
      />
    );
  }

  if (activeCardDrawer === 'staff_salary') {
    return (
      <StaffSalaryDetail
        data={{
          totalStaffSalaryPaid: calculatedMetrics.totalStaffSalaryPaid,
          salaryPayments: filteredSalaries,
        }}
        onBack={onClearDrawer}
        onDeletePayment={onDeleteSalaryPayment}
      />
    );
  }

  if (activeCardDrawer === 'net_profit' || activeCardDrawer === 'net_loss') {
    return (
      <NetProfitDetail
        data={{
          netProfit: calculatedMetrics.netProfit,
          grossRevenue: calculatedMetrics.grossRevenue,
          totalFarmCost: calculatedMetrics.totalFarmCost,
          profitPerLiter: calculatedMetrics.profitPerLiter,
          netMargin: calculatedMetrics.netMargin,
          totalVolume: calculatedMetrics.totalVolume,
        }}
        onBack={onClearDrawer}
      />
    );
  }

  return null;
}
