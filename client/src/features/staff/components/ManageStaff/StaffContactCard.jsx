import React from 'react';
import { User, Phone, Mail, CreditCard } from 'lucide-react';
import { Typography } from '@/components/common/Typography';

export default function StaffContactCard({ staff }) {
  if (!staff) return null;

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      <div className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-slate-700">
        <User className="w-4 h-4 text-slate-500" />
        Contact &amp; Identification
      </div>
      <div className="space-y-2.5 divide-y divide-slate-200/60 text-xs text-slate-700">
        <div className="flex justify-between items-center pt-1.5">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number:
          </span>
          <span className="font-mono font-bold text-slate-800">
            {staff.mobile || '—'}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
          </span>
          <span className="font-medium text-slate-800">
            {staff.email || '—'}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-500 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" /> CNIC:
          </span>
          <span className="font-mono font-bold text-slate-800">
            {staff.cnic || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
