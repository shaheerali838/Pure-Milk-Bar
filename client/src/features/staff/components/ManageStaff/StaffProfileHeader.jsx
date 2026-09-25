import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';

export default function StaffProfileHeader({ staff }) {
  if (!staff) return null;

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider'))
      return 'bg-amber-50 text-amber-700 border-amber-200';
    if (r.includes('farm'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r.includes('security'))
      return 'bg-rose-50 text-rose-700 border-rose-200';
    if (r.includes('cashier'))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    if (r.includes('manager'))
      return 'bg-purple-50 text-purple-700 border-purple-200';
    if (r.includes('accountant'))
      return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-2xs shrink-0 font-display overflow-hidden">
          {staff.image ? (
            <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
          ) : (
            staff.name ? staff.name.charAt(0).toUpperCase() : 'S'
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Typography variant="h3" className="font-bold text-slate-900 font-display text-lg sm:text-xl leading-tight">
              {staff.name}
            </Typography>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
              {staff.id}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border ${getRoleBadgeStyle(
                staff.role
              )}`}
            >
              {staff.role}
            </span>
            {(() => {
              const isActive =
                staff.status !== 'Inactive' &&
                staff.status !== 'Off Duty' &&
                staff.active !== false;

              return isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active On Duty
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Off Duty / Inactive
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <Typography variant="overline" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            MONTHLY NET COMPENSATION
          </Typography>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular block">
            Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 block">
            Rs. {Math.round(Number(staff.monthlySalary || 0) / 30).toLocaleString()} / day
          </span>
        </div>
      </div>
    </div>
  );
}
