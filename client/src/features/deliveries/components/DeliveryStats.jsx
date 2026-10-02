import React from 'react';
import { Truck, Clock, CheckCircle2, Banknote } from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';

export default function DeliveryStats() {
  const { deliveries = [] } = useDeliveryContext();

  const now = new Date();
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayUTC = now.toISOString().split('T')[0];

  const isToday = (d) => {
    if (!d) return false;
    try {
      const str = typeof d === 'string' ? d.split('T')[0] : String(d).slice(0, 10);
      if (str === todayLocal || str === todayUTC) return true;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return false;
      const yr = dateObj.getFullYear();
      const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
      const da = String(dateObj.getDate()).padStart(2, '0');
      const parsedLocal = `${yr}-${mo}-${da}`;
      const parsedUTC = dateObj.toISOString().split('T')[0];
      return parsedLocal === todayLocal || parsedUTC === todayUTC;
    } catch {
      const str = typeof d === 'string' ? d.split('T')[0] : String(d).slice(0, 10);
      return str === todayLocal || str === todayUTC;
    }
  };

  const todayDeliveries = deliveries.filter(
    (d) => isToday(d.date) || isToday(d.createdAt)
  );

  const todayCount = todayDeliveries.length;
  const todayPending = todayDeliveries.filter(
    (d) => d.status === 'PENDING' || d.status === 'OUT_FOR_DELIVERY'
  ).length;
  const todayDelivered = todayDeliveries.filter((d) => d.status === 'DELIVERED').length;

  const allPending = deliveries.filter(
    (d) => d.status === 'PENDING' || d.status === 'OUT_FOR_DELIVERY'
  ).length;
  const allDelivered = deliveries.filter((d) => d.status === 'DELIVERED').length;

  // Pending COD calculation: include deliveries not yet paid or not delivered
  const codToCollect = deliveries
    .filter((d) => d.status !== 'DELIVERED' || d.paymentStatus === 'UNPAID' || d.paymentStatus === 'PARTIAL')
    .reduce((acc, d) => acc + (Number(d.codAmountToCollect || d.amountDue) || 0), 0);

  const todayCodToCollect = todayDeliveries
    .filter((d) => d.status !== 'DELIVERED' || d.paymentStatus === 'UNPAID' || d.paymentStatus === 'PARTIAL')
    .reduce((acc, d) => acc + (Number(d.codAmountToCollect || d.amountDue) || 0), 0);

  const statCards = [
    {
      label: "TODAY'S DELIVERIES",
      value: `${todayCount}`,
      sub: todayCount > 0 ? `${todayDelivered} done · ${todayPending} in route` : `All-time: ${deliveries.length} drops`,
      icon: Truck,
      color: '#155dfc',
      badge: 'Today',
    },
    {
      label: 'PENDING',
      value: `${allPending}`,
      sub: todayPending > 0 ? `${todayPending} scheduled today` : 'Awaiting delivery runs',
      icon: Clock,
      color: '#f59e0b',
      badge: 'In Route',
    },
    {
      label: 'DELIVERED',
      value: `${allDelivered}`,
      sub: todayDelivered > 0 ? `${todayDelivered} completed today` : 'Successfully completed',
      icon: CheckCircle2,
      color: '#009966',
      badge: 'Done',
    },
    {
      label: 'COD TO COLLECT',
      value: `Rs. ${codToCollect.toLocaleString()}`,
      sub: todayCodToCollect > 0 ? `Rs. ${todayCodToCollect.toLocaleString()} pending today` : 'Pending cash on delivery',
      icon: Banknote,
      color: '#e11d48',
      badge: 'Cash Due',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span className="text-[10px] font-bold px-3 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              {badge}
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-medium text-slate-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
