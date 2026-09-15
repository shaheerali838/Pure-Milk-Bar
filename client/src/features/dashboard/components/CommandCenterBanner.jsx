import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Activity } from 'lucide-react';

export default function CommandCenterBanner() {
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-[#1e293b] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
            Pure Milk Bar ERP Command Center
          </h1>
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE OPERATIONS
          </Badge>
        </div>
        <p className="text-xs text-slate-300 font-medium">
          Farm Production, Sourcing, Retail POS &amp; Daily Closings
        </p>
      </div>

      <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 shrink-0 self-start md:self-auto">
        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-slate-200">{formattedDate}</span>
      </div>
    </div>
  );
}
