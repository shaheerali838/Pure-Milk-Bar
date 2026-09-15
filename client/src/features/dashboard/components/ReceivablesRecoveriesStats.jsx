import React from 'react';
import { Wallet, TrendingUp, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerContext } from '@/context/CustomerContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';

export default function ReceivablesRecoveriesStats() {
  const { totalKhataReceivable = 0, withKhataBalCount = 0 } = useCustomerContext() || {};
  const { ledgers = {} } = useLedgerContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};

  const todayISO = new Date().toISOString().split('T')[0];

  // Calculate Recoveries (Today): all credit entries across all customers today
  let recoveriesTodayAmount = 0;
  let recoveriesTodayCount = 0;

  Object.values(ledgers).forEach((entries) => {
    if (Array.isArray(entries)) {
      entries.forEach((entry) => {
        if (entry.date === todayISO && Number(entry.credit) > 0) {
          recoveriesTodayAmount += Number(entry.credit) || 0;
          recoveriesTodayCount += 1;
        }
      });
    }
  });

  // Calculate Milk Deliveries Today
  const todayDeliveries = deliveries.filter((d) => d.date === todayISO);
  const totalDeliveriesToday = todayDeliveries.length;
  const deliveredToday = todayDeliveries.filter((d) => d.status === 'DELIVERED').length;
  const pendingToday = todayDeliveries.filter((d) => d.status !== 'DELIVERED').length;

  const kpis = [
    {
      title: 'TOTAL RECEIVABLES',
      value: `Rs. ${totalKhataReceivable.toLocaleString()}`,
      subtext: `${withKhataBalCount} customers outstanding`,
      icon: Wallet,
      color: '#e11d48',
      badge: 'Khata Due',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'RECOVERIES (TODAY)',
      value: `Rs. ${recoveriesTodayAmount.toLocaleString()}`,
      subtext: `${recoveriesTodayCount} customer payments today`,
      icon: TrendingUp,
      color: '#059669',
      badge: 'Collected',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'MILK DELIVERIES',
      value: `${deliveredToday} / ${totalDeliveriesToday}`,
      subtext: `${pendingToday} pending deliveries`,
      icon: Truck,
      color: '#2563eb',
      badge: 'Today Runs',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.title}
            className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            style={{ borderTop: `3px solid ${kpi.color}` }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${kpi.color}15` }}
              >
                <Icon style={{ width: 16, height: 16, color: kpi.color }} />
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${kpi.badgeColor}`}
              >
                {kpi.badge}
              </Badge>
            </div>

            <div>
              <p className="font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight tabular tracking-tight mb-1">
                {kpi.value}
              </p>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                {kpi.title}
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                {kpi.subtext}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
