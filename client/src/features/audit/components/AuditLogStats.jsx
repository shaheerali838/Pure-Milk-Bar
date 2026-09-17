import React from 'react';
import { History, Calendar, AlertTriangle, Users } from 'lucide-react';
import { useAuditContext } from '@/context/AuditContext';
import { Typography } from '@/components/common/Typography';

export default function AuditLogStats() {
  const { metrics = {} } = useAuditContext();

  const {
    totalEvents = 0,
    todayCount = 0,
    criticalCount = 0,
    activeUsersCount = 0,
  } = metrics;

  const statCards = [
    {
      label: 'Total Audit Events',
      value: Number(totalEvents).toLocaleString(),
      sub: 'All-time immutable logged records',
      icon: History,
      color: '#00a86b', // emerald
      badge: 'System Log',
    },
    {
      label: 'Events Today',
      value: Number(todayCount).toLocaleString(),
      sub: 'Activity recorded today',
      icon: Calendar,
      color: '#2563eb', // blue
      badge: 'Real-time',
    },
    {
      label: 'Critical / Deletions',
      value: Number(criticalCount).toLocaleString(),
      sub: 'High-priority security deletions',
      icon: AlertTriangle,
      color: '#e11d48', // rose
      badge: 'Security',
    },
    {
      label: 'Active Users / Operators',
      value: Number(activeUsersCount).toLocaleString(),
      sub: 'Operators triggering operations',
      icon: Users,
      color: '#7e22ce', // purple
      badge: 'Operators',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-xs transition-all duration-200"
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              {badge}
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <Typography variant="bodySmall" className="font-bold text-slate-700 text-xs">
              {label}
            </Typography>
            <Typography variant="caption" color="muted" className="text-[11px]">
              {sub}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
}
