import React from 'react';
import { Truck, Milk, DollarSign, Fuel, Users } from 'lucide-react';

export default function DeliveryFinanceStats({
  filteredDeliveries = [],
  filteredFuelLogs = [],
  totalSalariesPaid = 0,
  timeRangeLabel = 'Today',
  onViewFuelDetail,
  onViewSalaryDetail,
}) {
  const totalDeliveries = filteredDeliveries.length;
  const totalLiters = filteredDeliveries.reduce(
    (sum, d) =>
      sum +
      (Number(d.qtyLiters) ||
        (Array.isArray(d.items)
          ? d.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)
          : 0)),
    0
  );
  const totalRevenue = filteredDeliveries.reduce(
    (sum, d) => sum + (Number(d.codAmountToCollect || d.amountPaid || 0)),
    0
  );
  const totalFuelCost = filteredFuelLogs.reduce(
    (sum, f) => sum + (Number(f.amount) || 0),
    0
  );

  const statCards = [
    {
      id: 'deliveries',
      label: 'DELIVERIES COMPLETED',
      value: `${totalDeliveries}`,
      sub: totalDeliveries > 0 ? `Drop points for ${timeRangeLabel.toLowerCase()}` : `No drops in ${timeRangeLabel.toLowerCase()}`,
      icon: Truck,
      color: '#155dfc',
      badge: timeRangeLabel,
      isClickable: false,
    },
    {
      id: 'liters',
      label: 'TOTAL MILK DELIVERED',
      value: `${totalLiters.toFixed(1)} L`,
      sub: 'Doorstep volume supplied',
      icon: Milk,
      color: '#009966',
      badge: 'Volume',
      isClickable: false,
    },
    {
      id: 'revenue',
      label: 'COD & CASH INFLOWS',
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      sub: 'Cash collected on delivery',
      icon: DollarSign,
      color: '#059669',
      badge: 'Revenue',
      isClickable: false,
    },
    {
      id: 'fuel',
      label: 'FUEL & FLEET EXPENSES',
      value: `Rs. ${totalFuelCost.toLocaleString()}`,
      sub: `${filteredFuelLogs.length} receipts logged • Fuel cost`,
      icon: Fuel,
      color: '#9333ea',
      badge: 'Fuel',
      isClickable: true,
      onClick: onViewFuelDetail,
      tooltip: 'Click to view detailed fuel breakdown by rider & date',
    },
    {
      id: 'salaries',
      label: 'RIDER SALARIES & PAYROLL',
      value: `Rs. ${totalSalariesPaid.toLocaleString()}`,
      sub: 'Staff payroll disbursements',
      icon: Users,
      color: '#0284c7',
      badge: 'Payroll',
      isClickable: true,
      onClick: onViewSalaryDetail,
      tooltip: 'Click to view complete rider salaries breakdown by month',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-2">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge, isClickable, onClick, tooltip }) => (
        <div
          key={label}
          onClick={isClickable && onClick ? onClick : undefined}
          title={tooltip || label}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs transition-all duration-200 ${
            isClickable ? 'cursor-pointer hover:border-blue-300 hover:shadow-md hover:bg-blue-50/10 active:scale-[0.99]' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
              isClickable ? 'text-slate-800 bg-slate-50 border-slate-200 font-extrabold' : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}>
              {badge}
            </span>
          </div>
          <div>
            <p className="font-display text-xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>{label}</span>
              {isClickable && <span className="text-[10px] text-blue-600 font-semibold font-sans">View &rarr;</span>}
            </p>
            <p className="text-[10px] font-medium text-slate-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

