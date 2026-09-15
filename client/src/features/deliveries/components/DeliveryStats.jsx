import React from 'react';
import { Truck, Clock, CheckCircle2, Banknote } from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';

export default function DeliveryStats() {
  const { deliveries } = useDeliveryContext();

  const todayISO = new Date().toISOString().split('T')[0];

  const todayDeliveriesCount = deliveries.filter(
    (d) => d.date && d.date.split('T')[0] === todayISO
  ).length;

  const pendingCount = deliveries.filter((d) => d.status === 'PENDING').length;
  const deliveredCount = deliveries.filter((d) => d.status === 'DELIVERED').length;

  const codToCollect = deliveries
    .filter((d) => d.status !== 'DELIVERED')
    .reduce((acc, d) => acc + (Number(d.codAmountToCollect) || 0), 0);

  const statCards = [
    {
      label: "TODAY'S DELIVERIES",
      value: `${todayDeliveriesCount}`,
      sub: 'Scheduled for today',
      icon: Truck,
      color: '#155dfc',
      badge: 'Today',
    },
    {
      label: 'PENDING',
      value: `${pendingCount}`,
      sub: 'Awaiting delivery',
      icon: Clock,
      color: '#f59e0b',
      badge: 'In Route',
    },
    {
      label: 'DELIVERED',
      value: `${deliveredCount}`,
      sub: 'Successfully completed',
      icon: CheckCircle2,
      color: '#009966',
      badge: 'Done',
    },
    {
      label: 'COD TO COLLECT',
      value: `Rs. ${codToCollect.toLocaleString()}`,
      sub: 'Pending cash on delivery',
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
          style={{ borderTop: `4px solid ${color}` }}
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
