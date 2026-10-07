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
      id: 'today_deliveries',
      label: "Today's Deliveries",
      value: `${todayCount}`,
      sub: todayCount > 0 ? `${todayDelivered} done · ${todayPending} in route` : `All-time: ${deliveries.length} drops`,
      icon: Truck,
      color: '#2563eb', // blue-600
      badge: 'Today',
    },
    {
      id: 'pending_deliveries',
      label: 'Pending In Route',
      value: `${allPending}`,
      sub: todayPending > 0 ? `${todayPending} scheduled today` : 'Awaiting delivery runs',
      icon: Clock,
      color: '#d97706', // amber-600
      badge: 'In Route',
    },
    {
      id: 'completed_deliveries',
      label: 'Delivered',
      value: `${allDelivered}`,
      sub: todayDelivered > 0 ? `${todayDelivered} completed today` : 'Successfully completed',
      icon: CheckCircle2,
      color: '#059669', // emerald-600
      badge: 'Done',
    },
    {
      id: 'cod_collect',
      label: 'COD To Collect',
      value: `Rs. ${codToCollect.toLocaleString()}`,
      sub: todayCodToCollect > 0 ? `Rs. ${todayCodToCollect.toLocaleString()} pending today` : 'Pending cash on delivery',
      icon: Banknote,
      color: '#e11d48', // rose-600
      badge: 'Cash Due',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2.5">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
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
