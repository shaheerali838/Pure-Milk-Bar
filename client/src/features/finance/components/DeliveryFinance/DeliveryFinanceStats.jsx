import React from 'react';
import { Truck, Milk, DollarSign, Fuel } from 'lucide-react';

export default function DeliveryFinanceStats({
  filteredDeliveries = [],
  filteredFuelLogs = [],
  totalSalariesPaid = 0,
  timeRangeLabel = 'Today',
}) {
  const totalDeliveries = filteredDeliveries.length;
  const totalLiters = filteredDeliveries.reduce(
    (sum, d) => sum + (Number(d.qtyLiters) || 0),
    0
  );
  const totalRevenue = filteredDeliveries.reduce(
    (sum, d) => sum + (Number(d.codAmountToCollect) || 0),
    0
  );
  const totalFuelCost = filteredFuelLogs.reduce(
    (sum, f) => sum + (Number(f.amount) || 0),
    0
  );
  const totalOperationsCost = totalFuelCost + totalSalariesPaid;

  const statCards = [
    {
      label: 'DELIVERIES COMPLETED',
      value: `${totalDeliveries}`,
      sub: `Drop points for ${timeRangeLabel.toLowerCase()}`,
      icon: Truck,
      color: '#155dfc',
      badge: timeRangeLabel,
    },
    {
      label: 'TOTAL MILK DELIVERED',
      value: `${totalLiters.toFixed(1)} L`,
      sub: 'Doorstep volume supplied',
      icon: Milk,
      color: '#009966',
      badge: 'Volume',
    },
    {
      label: 'COD & CASH INFLOWS',
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      sub: 'Cash collected on delivery',
      icon: DollarSign,
      color: '#059669',
      badge: 'Revenue',
    },
    {
      label: 'FUEL & RIDER EXPENSES',
      value: `Rs. ${totalOperationsCost.toLocaleString()}`,
      sub: `Fuel: Rs. ${totalFuelCost.toLocaleString()} + Payroll`,
      icon: Fuel,
      color: '#9333ea',
      badge: 'Expenses',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: `3.5px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded text-slate-600 bg-slate-100 border border-slate-200">
              {badge}
            </span>
          </div>
          <div>
            <p className="font-display text-xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[10px] font-medium text-slate-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
