import React from 'react';
import { Truck, Clock, CheckCircle2, Banknote } from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { isDateInFilterRange } from '@/utils/dateUtils';

export default function DeliveryStats() {
  const {
    deliveries = [],
    dateFilter = 'Today',
    startDate = '',
    endDate = '',
  } = useDeliveryContext();

  const periodDeliveries = deliveries.filter((d) =>
    isDateInFilterRange(d.date || d.createdAt, dateFilter, startDate, endDate)
  );

  const totalCount = periodDeliveries.length;
  const pendingCount = periodDeliveries.filter(
    (d) => d.status === 'PENDING' || d.status === 'OUT_FOR_DELIVERY'
  ).length;
  const deliveredCount = periodDeliveries.filter((d) => d.status === 'DELIVERED').length;

  const codToCollect = periodDeliveries
    .filter(
      (d) =>
        d.status !== 'DELIVERED' ||
        d.paymentStatus === 'UNPAID' ||
        d.paymentStatus === 'PARTIAL'
    )
    .reduce((acc, d) => acc + (Number(d.codAmountToCollect || d.amountDue) || 0), 0);

  const getPrimaryLabel = () => {
    switch (dateFilter) {
      case 'Today':
        return "Today's Deliveries";
      case 'Weekly':
        return 'Weekly Deliveries';
      case 'Monthly':
        return 'Monthly Deliveries';
      case 'Custom Range':
        return 'Deliveries (Selected)';
      default:
        return 'All-Time Deliveries';
    }
  };

  const getPrimarySub = () => {
    if (totalCount === 0) return 'No deliveries in selected range';
    return `${deliveredCount} Completed · ${pendingCount} Pending`;
  };

  const getPendingSub = () => {
    if (pendingCount === 0) return 'All deliveries completed';
    if (dateFilter === 'Today') return `${pendingCount} scheduled for today`;
    return `${pendingCount} pending in selected period`;
  };

  const getDeliveredSub = () => {
    if (deliveredCount === 0) return 'No completed orders yet';
    if (dateFilter === 'Today') return `${deliveredCount} fulfilled today`;
    return `${deliveredCount} fulfilled in period`;
  };

  const getCodSub = () => {
    if (codToCollect === 0) return 'No pending COD amount';
    if (dateFilter === 'Today') return `Rs. ${codToCollect.toLocaleString()} to collect today`;
    return `Rs. ${codToCollect.toLocaleString()} in selected period`;
  };

  const statCards = [
    {
      label: getPrimaryLabel(),
      value: `${totalCount} Drops`,
      sub: getPrimarySub(),
      icon: Truck,
      color: '#2563eb',
      badge: 'Runs',
    },
    {
      label: 'Pending In Route',
      value: `${pendingCount} Orders`,
      sub: getPendingSub(),
      icon: Clock,
      color: '#d97706',
      badge: 'In Route',
    },
    {
      label: 'Delivered Orders',
      value: `${deliveredCount} Completed`,
      sub: getDeliveredSub(),
      icon: CheckCircle2,
      color: '#059669',
      badge: 'Done',
    },
    {
      label: 'COD Cash Due',
      value: `Rs. ${codToCollect.toLocaleString()}`,
      sub: getCodSub(),
      icon: Banknote,
      color: '#e11d48',
      badge: 'Cash Due',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs"
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                {badge}
              </span>
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-800">{label}</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


