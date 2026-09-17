import React from 'react';
import { DollarSign, CreditCard, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Typography } from '@/components/common/Typography';

export default function StaffPayrollBreakdown({ staff }) {
  if (!staff) return null;

  const monthlySalary = Number(staff.monthlySalary || 0);
  const dailyRate = Math.round(monthlySalary / 30);

  // Derive department from role
  const getDepartment = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider')) return 'Logistics & Doorstep Delivery';
    if (r.includes('farm') || r.includes('milking') || r.includes('shed')) return 'Farm Shed & Animal Care';
    if (r.includes('security') || r.includes('guard')) return 'Security & Physical Safety';
    if (r.includes('cashier') || r.includes('pos') || r.includes('counter')) return 'Retail POS & Counter Sales';
    if (r.includes('accountant') || r.includes('finance')) return 'Accounts & General Ledger';
    if (r.includes('manager')) return 'General Operations & Management';
    return 'General Operations';
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <Typography variant="h4" className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Monthly Payroll &amp; Wage Slip Breakdown
            </Typography>
            <Typography variant="caption" color="muted">
              Compensation schedule, statutory identification, and payroll metrics
            </Typography>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          Standard 30-Day Cycle
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Metric 1: Base Salary */}
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-0.5">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
            Base Monthly Salary
          </span>
          <span className="text-base font-black text-slate-900 font-mono tabular block">
            Rs. {monthlySalary.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700/80 block">
            Contracted monthly wage
          </span>
        </div>

        {/* Metric 2: Pro-rated Daily Rate */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
            Pro-Rated Daily Rate
          </span>
          <span className="text-base font-black text-slate-800 font-mono tabular block">
            Rs. {dailyRate.toLocaleString()} / day
          </span>
          <span className="text-[10px] text-slate-400 block">
            Calculated as Base / 30 days
          </span>
        </div>

        {/* Metric 3: Duty Attendance */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
            Duty Attendance
          </span>
          <span className="text-base font-bold text-slate-400 block">
            —
          </span>
          <span className="text-[10px] text-slate-400 block">
            Not tracked yet (coming soon)
          </span>
        </div>

        {/* Metric 4: Allowances & Fuel */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
            Allowances &amp; Stipend
          </span>
          <span className="text-base font-bold text-slate-400 block">
            —
          </span>
          <span className="text-[10px] text-slate-400 block">
            Not tracked yet
          </span>
        </div>
      </div>

      {/* Breakdown Key-Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs text-slate-700">
        <div className="space-y-2 divide-y divide-slate-100">
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Government CNIC:</span>
            <span className="font-mono font-bold text-slate-900">{staff.cnic || '—'}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-500">Department / Domain:</span>
            <span className="font-bold text-slate-800">{getDepartment(staff.role)}</span>
          </div>
        </div>

        <div className="space-y-2 divide-y divide-slate-100">
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Payment Status:</span>
            <span className="text-slate-400 font-medium">Not tracked yet</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-500">Last System Auth:</span>
            <span className="text-slate-400 font-medium">Not tracked yet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
