import React from 'react';
import { Droplets,Beef,Truck,Layers,ShoppingBag,ArrowDownLeft,ChevronRight,DollarSign,TrendingUp,} from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { getPktTodayString } from '@/utils/dateUtils';

import { Link } from 'react-router-dom';
import { KpiGridSkeleton } from '@/components/ui/skeleton';

export default function TopSummaryCards() {
  const { animals = [], isLoading: isAnimalsLoading } = useAnimalContext();
  const { intakeLogs = [], totals: intakeTotals = {}, isLoading: isIntakeLoading } = useIntakeContext();
  const { salesHistory = [], inventoryMetrics = {}, businessFinancialMetrics = {} } = usePOSContext();
  const { ledgers = {}, getAllCustomersAggregates } = useLedgerContext() || {};
  const { totalKhataReceivable = 0, withKhataBalCount = 0 } = useCustomerContext() || {};

  if (isAnimalsLoading && isIntakeLoading && animals.length === 0 && intakeLogs.length === 0) {
    return <KpiGridSkeleton count={8} />;
  }

  // 1. Farm Milk Production
  const totalFarmMilk = Number(inventoryMetrics.totalFarmYield) || 0;
  const milkingAnimalsCount = animals.filter(
    (a) => a.lactationStatus === 'Milking'
  ).length;

  // 2. Purchased Supplier Milk
  const totalProcuredMilk =
    intakeTotals.totalProcuredVolume !== undefined
      ? intakeTotals.totalProcuredVolume
      : intakeLogs.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);
  const avgPurchaseRate =
    intakeTotals.avgPurchaseRate ||
    (totalProcuredMilk > 0
      ? intakeLogs.reduce((sum, i) => sum + (parseFloat(i.totalCost) || 0), 0) /
        totalProcuredMilk
      : 0);

  // 3. Total Milk Sourced (Farm + Procurement)
  const totalMilkSourced = totalFarmMilk + totalProcuredMilk;

  const farmNetProfit = Number(businessFinancialMetrics.farmNetProfit) || 0;
  const supplierNetProfit = Number(businessFinancialMetrics.supplierNetProfit) || 0;
  const totalNetProfit = Number(businessFinancialMetrics.totalBusinessNetProfit) || 0;
  const netMargin = Number(businessFinancialMetrics.totalBusinessMargin) || 0;

  const todayISO = getPktTodayString();
  const todaySales = salesHistory.filter((s) => {
    const raw = s.date || s.timestamp || s.formattedDate || s.createdAt || '';
    const saleDate = raw.includes('T') ? raw.split('T')[0] : (raw.includes('-') ? raw.slice(0, 10) : '');
    return saleDate === todayISO || s.date === todayISO;
  });

  let todaySalesRevenue = 0;
  let todayMilkSoldQty = 0;
  let todayMilkSalesRevenue = 0;
  let todayFarmMilkSoldQty = 0;
  let todaySupplierMilkSoldQty = 0;
  let todayFarmMilkRevenue = 0;
  let todaySupplierMilkRevenue = 0;
  let todayDahiSoldQty = 0;

  todaySales.forEach((sale) => {
    todaySalesRevenue += (Number(sale.netPayable || sale.totalAmount || sale.grandTotal) || 0);
    (sale.items || []).forEach((item) => {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const qty = Number(item.quantity) || 0;
      const rev = Number(item.subtotal || item.effectiveRevenue) || (qty * (Number(item.price) || 0));
      const isDahi = name.includes('dahi') || cat.includes('dahi') || name.includes('yogurt');
      if (isDahi) {
        todayDahiSoldQty += qty;
      } else {
        todayMilkSoldQty += qty;
        todayMilkSalesRevenue += rev;
        const fQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) || 0 : (item.source === 'Farm' ? qty : 0);
        const sQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) || 0 : (item.source === 'Supplier' ? qty : 0);
        const fRev = item.farmRevenue !== undefined ? Number(item.farmRevenue) || 0 : (item.source === 'Farm' ? rev : 0);
        const sRev = item.supplierRevenue !== undefined ? Number(item.supplierRevenue) || 0 : (item.source === 'Supplier' ? rev : 0);
        todayFarmMilkSoldQty += fQty;
        todaySupplierMilkSoldQty += sQty;
        todayFarmMilkRevenue += fRev;
        todaySupplierMilkRevenue += sRev;
      }
    });
  });

  // 6. Recoveries (Credit payments into Ledgers & Cash inflows)
  const customerAggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : null;
  let ledgerRecoveriesSum = 0;
  Object.values(ledgers).forEach((entries) => {
    (entries || []).forEach((entry) => {
      if (entry.type === 'CREDIT' || Number(entry.credit) > 0) {
        ledgerRecoveriesSum += Number(entry.credit) || 0;
      }
    });
  });
  const totalRecoveries = Math.max(ledgerRecoveriesSum, Number(customerAggregates?.totalAllPaid) || 0);
  const pendingKhataTotal = customerAggregates?.totalAllDue !== undefined ? customerAggregates.totalAllDue : totalKhataReceivable;
  const pendingAccountsCount = customerAggregates?.khataAccountsCount ?? withKhataBalCount;

  const totalMilkStock = inventoryMetrics?.totalMilkStock ?? '0';
  const farmMilkStock = inventoryMetrics?.farmMilkStock ?? '0';
  const supplierMilkStock = inventoryMetrics?.supplierMilkStock ?? '0';
  const totalDahiStock = inventoryMetrics?.totalDahiStock ?? '0';

  const cards = [
    {
      id: 'total-net-profit',
      title: 'Total Business Net Profit',
      value: `${totalNetProfit >= 0 ? '+' : '-'}Rs. ${Math.abs(totalNetProfit).toLocaleString()}`,
      subtitle: `${netMargin}% Consolidated Margin`,
      icon: DollarSign,
      color: totalNetProfit >= 0 ? '#059669' : '#dc2626',
      tag: 'Main P&L',
      to: '/farm/pl',
    },
    {
      id: 'farm-net-profit',
      title: 'Farm Net Profit',
      value: `${farmNetProfit >= 0 ? '+' : '-'}Rs. ${Math.abs(farmNetProfit).toLocaleString()}`,
      subtitle: `In-House Dairy P&L`,
      icon: TrendingUp,
      color: farmNetProfit >= 0 ? '#009966' : '#dc2626',
      tag: 'Farm P&L',
      to: '/farm/pl',
    },
    {
      id: 'supplier-net-profit',
      title: 'Supplier Net Profit',
      value: `${supplierNetProfit >= 0 ? '+' : '-'}Rs. ${Math.abs(supplierNetProfit).toLocaleString()}`,
      subtitle: `Procurement P&L`,
      icon: TrendingUp,
      color: supplierNetProfit >= 0 ? '#0284c7' : '#dc2626',
      tag: 'Supplier P&L',
      to: '/farm/pl',
    },
    {
      id: 'available-milk-stock',
      title: 'Available Milk Stock',
      value: `${totalMilkStock} L`,
      subtitle: `Farm: ${farmMilkStock}L • Sup: ${supplierMilkStock}L`,
      icon: Droplets,
      color: '#059669',
      tag: 'Chiller Stock',
      to: '/pos',
    },
    {
      id: 'total-sourced',
      title: 'Total Milk Sourced',
      value: `${totalMilkSourced.toFixed(1)} L`,
      subtitle: `Farm: ${totalFarmMilk.toFixed(0)}L • Procured: ${totalProcuredMilk.toFixed(0)}L`,
      icon: Droplets,
      color: '#155dfc',
      tag: 'Combined Inflow',
      to: '/supplier/intake',
    },
    {
      id: 'todays-milk-sold',
      title: "Total Milk Sold Today",
      value: `${Number(todayMilkSoldQty.toFixed(1))} L`,
      subtitle: `Farm: ${Number(todayFarmMilkSoldQty.toFixed(1))}L • Sup: ${Number(todaySupplierMilkSoldQty.toFixed(1))}L`,
      icon: Droplets,
      color: '#10b981',
      tag: 'Combined Sales',
      to: '/pos',
    },
    {
      id: 'todays-milk-revenue',
      title: 'Total Milk Sales Revenue',
      value: `+ Rs. ${todayMilkSalesRevenue.toLocaleString()}`,
      subtitle: `Farm: Rs. ${todayFarmMilkRevenue.toLocaleString()} • Sup: Rs. ${todaySupplierMilkRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#059669',
      tag: 'Combined Revenue',
      to: '/pos',
    },
    {
      id: 'todays-dahi-sold',
      title: "Today's Dahi Sold",
      value: `${Number(todayDahiSoldQty.toFixed(1))} Kg`,
      subtitle: `Farm + Supplier Dahi`,
      icon: Layers,
      color: '#0284c7',
      tag: 'Live Counter',
      to: '/pos',
    },
    {
      id: 'todays-sales',
      title: "Total Business Revenue",
      value: `Rs. ${todaySalesRevenue.toLocaleString()}`,
      subtitle: `${todaySales.length} orders today`,
      icon: ShoppingBag,
      color: '#059669',
      tag: 'POS Money In',
      to: '/pos',
    },
    {
      id: 'recoveries',
      title: 'Recoveries',
      value: `Rs. ${totalRecoveries.toLocaleString()}`,
      subtitle: `${pendingAccountsCount} accounts • Due: Rs. ${Number(pendingKhataTotal || 0).toLocaleString()}`,
      icon: ArrowDownLeft,
      color: '#d97706',
      tag: 'Recovery',
      to: '/customer-khata-ledger',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            to={card.to}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none group relative overflow-hidden"
            title={`Open ${card.title}`}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                style={{ background: `${card.color}18` }}
              >
                <Icon style={{ width: 18, height: 18, color: card.color }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-slate-700 bg-slate-100/90 shadow-2xs">
                  {card.tag}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 font-display tabular">
                {card.value}
              </p>
              <p className="text-xs font-bold text-slate-700">{card.title}</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                {card.subtitle}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

