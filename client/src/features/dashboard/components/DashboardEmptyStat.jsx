import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardEmptyStat({ title, icon: Icon, color = '#64748b' }) {
  return (
    <Card
      className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between"
      style={{ borderTop: `3px solid ${color}40` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15` }}
        >
          {Icon && <Icon style={{ width: 14, height: 14, color }} />}
        </div>
        <Badge
          variant="outline"
          className="text-[9px] font-bold px-2 py-0.2 rounded text-slate-400 bg-slate-50 border-slate-200"
        >
          Coming soon
        </Badge>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <p className="text-[11px] font-medium text-slate-400 italic">
          No data logged yet
        </p>
      </div>
    </Card>
  );
}
